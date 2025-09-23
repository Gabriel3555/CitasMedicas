<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Paciente;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        Log::info('Register attempt', $request->all());

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:paciente,doctor,admin',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed', $validator->errors()->toArray());
            return response()->json($validator->errors(), 400);
        }

        Log::info('Validation passed, creating user');

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        Log::info('User created', ['user_id' => $user->id, 'role' => $request->role]);

        try {
            // Crear el perfil correspondiente
            if ($request->role === 'paciente') {
                Log::info('Creating paciente profile');
                Paciente::create([
                    'user_id' => $user->id,
                    'nombre' => $request->name,
                    'email' => $request->email,
                    'telefono' => '1234567890',
                    'documento' => uniqid('doc_', true),
                    'eps_id' => $eps->id,
                ]);
                Log::info('Paciente profile created');
            } elseif ($request->role === 'doctor') {
                Log::info('Creating doctor profile');

                // Asegurarse de que existan especialidades y EPS
                $especialidad = \App\Models\Especialidad::first();
                if (!$especialidad) {
                    $especialidad = \App\Models\Especialidad::create(['nombre' => 'Medicina General']);
                }

                $eps = \App\Models\EPS::first();
                if (!$eps) {
                    $eps = \App\Models\EPS::create(['nombre' => 'EPS Salud']);
                }

                Doctor::create([
                    'user_id' => $user->id,
                    'nombre' => $request->name,
                    'email' => $request->email,
                    'telefono' => '1234567890',
                    'especialidad_id' => $especialidad->id,
                    'eps_id' => $eps->id,
                    'start_time' => '09:00',
                    'end_time' => '17:00',
                ]);
                Log::info('Doctor profile created');
            }
            // Admin no necesita perfil adicional

            Log::info('Generating token');
            $token = JWTAuth::fromUser($user);

            Log::info('Registration successful');
            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'user' => in_array($request->role, ['paciente', 'doctor']) ? $user->load($request->role) : $user, // Cargar el perfil si aplica
                'token' => $token
            ], 201);
        } catch (\Exception $e) {
            Log::error('Profile creation failed', ['error' => $e->getMessage()]);
            // Delete the user if profile creation fails
            $user->delete();
            return response()->json(['error' => 'Error al crear el perfil de usuario'], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        $user = Auth::user();

        // Cargar el perfil correspondiente si aplica
        $user = in_array($user->role, ['paciente', 'doctor']) ? User::with($user->role)->find($user->id) : $user;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Logout exitoso']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al hacer logout'], 500);
        }
    }

    public function me()
    {
        $user = Auth::user();

        // Cargar el perfil correspondiente si aplica
        $user = in_array($user->role, ['paciente', 'doctor']) ? User::with($user->role)->find($user->id) : $user;

        // Agregar la URL completa de la foto si existe
        if ($user->photo) {
            $user->photo_url = url('storage/' . $user->photo);
        }

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Actualizar datos básicos del usuario
        if ($request->has('name')) {
            $user->name = $request->name;
            $user->save();
        }

        if ($request->has('email')) {
            $user->email = $request->email;
            $user->save();
        }

        // Si es paciente, actualizar datos del perfil de paciente
        if ($user->role === 'paciente' && $user->paciente) {
            if ($request->has('telefono')) {
                $user->paciente->update(['telefono' => $request->telefono]);
            }
        }

        // Si es doctor, actualizar datos del perfil de doctor
        if ($user->role === 'doctor' && $user->doctor) {
            if ($request->has('telefono')) {
                $user->doctor->update(['telefono' => $request->telefono]);
            }
        }

        // Recargar el usuario con el perfil actualizado
        $user = in_array($user->role, ['paciente', 'doctor']) ? User::with($user->role)->find($user->id) : $user;

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user
        ]);
    }

    public function uploadPhoto(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();

            // Guardar en storage/app/public/avatars usando el disco public
            $path = $file->storeAs('avatars', $filename, 'public');

            // Actualizar la ruta en la base de datos (solo el nombre del archivo)
            $user->photo = 'avatars/' . $filename;
            $user->save();

            // Recargar el usuario con el perfil actualizado
            $user = in_array($user->role, ['paciente', 'doctor']) ? User::with($user->role)->find($user->id) : $user;

            return response()->json([
                'message' => 'Foto de perfil subida exitosamente',
                'user' => $user,
                'photo_url' => asset('storage/' . $user->photo)
            ]);
        }

        return response()->json(['error' => 'Error al subir la foto'], 500);
    }

    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json([
                'message' => 'Token refrescado',
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al refrescar token'], 500);
        }
    }
}
