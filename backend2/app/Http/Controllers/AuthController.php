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

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:paciente,doctor,admin',
            'telefono' => 'nullable|string|max:20',
            'eps_id' => 'nullable|exists:eps,id',
            'especialidad_id' => 'nullable|exists:especialidades,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        if ($request->role === 'paciente') {
            Paciente::create([
                'user_id' => $user->id,
                'nombre' => $request->name,
                'email' => $request->email,
                'telefono' => $request->telefono ?? null,
                'eps_id' => $request->eps_id ?? null,
            ]);
        } elseif ($request->role === 'doctor') {
            Doctor::create([
                'user_id' => $user->id,
                'nombre' => $request->name,
                'email' => $request->email,
                'telefono' => $request->telefono ?? null,
                'especialidad_id' => $request->especialidad_id ?? null,
                'eps_id' => $request->eps_id ?? null,
            ]);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'token' => $token
        ], 201);
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

        if ($user->photo) {
            $user->photo_url = url('storage/' . $user->photo);
        }

        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $user->doctor_profile = $doctor;
            }
        }

        if ($user->role === 'paciente') {
            $paciente = Paciente::where('user_id', $user->id)->first();
            if ($paciente) {
                $user->paciente_profile = $paciente;
            }
        }

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'telefono' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
            $user->save();

            if ($user->role === 'paciente') {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $paciente->nombre = $request->name;
                    $paciente->save();
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if ($doctor) {
                    $doctor->nombre = $request->name;
                    $doctor->save();
                }
            }
        }

        if ($request->has('email')) {
            $user->email = $request->email;
            $user->save();

            if ($user->role === 'paciente') {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $paciente->email = $request->email;
                    $paciente->save();
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if ($doctor) {
                    $doctor->email = $request->email;
                    $doctor->save();
                }
            }
        }

        // Actualizar teléfono para pacientes y doctores
        if ($request->has('telefono')) {
            if ($user->role === 'paciente') {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $paciente->telefono = $request->telefono;
                    $paciente->save();
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if ($doctor) {
                    $doctor->telefono = $request->telefono;
                    $doctor->save();
                }
            }
        }

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['current_password' => ['La contraseña actual es incorrecta']], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Contraseña cambiada exitosamente'
        ]);
    }

    public function adminChangeUserPassword(Request $request, $user_id)
    {
        $admin = Auth::user();

        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized - Admin access required'], 403);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::find($user_id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if ($user->id === $admin->id) {
            return response()->json(['error' => 'Use the regular change password endpoint for your own account'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'User password changed successfully',
            'user_id' => $user->id,
            'user_email' => $user->email
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

            $path = $file->storeAs('avatars', $filename, 'public');

            $user->photo = 'avatars/' . $filename;
            $user->save();

            $user = User::find($user->id);

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
