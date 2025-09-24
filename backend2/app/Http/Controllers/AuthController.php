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
            'role' => 'required|in:admin',
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

        // Admin no necesita perfil adicional
        Log::info('Generating token');
        $token = JWTAuth::fromUser($user);

        Log::info('Registration successful');
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

        // Admin no necesita perfil adicional

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

            // Recargar el usuario
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
