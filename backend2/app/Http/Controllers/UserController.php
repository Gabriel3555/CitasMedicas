<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Paciente;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users, 200);
    }

    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:paciente,doctor,admin',
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

        // Crear el perfil correspondiente si es necesario
        if ($request->role === 'paciente') {
            Paciente::create([
                'user_id' => $user->id,
                'nombre' => $request->name,
                'email' => $request->email,
                'telefono' => $request->telefono ?? '1234567890',
                'documento' => uniqid('doc_', true),
                'eps_id' => $request->eps_id ?? 1,
            ]);
        } elseif ($request->role === 'doctor') {
            Doctor::create([
                'user_id' => $user->id,
                'nombre' => $request->name,
                'email' => $request->email,
                'telefono' => $request->telefono ?? '1234567890',
                'especialidad_id' => $request->especialidad_id ?? 1,
                'eps_id' => $request->eps_id ?? 1,
                'start_time' => $request->start_time ?? '09:00',
                'end_time' => $request->end_time ?? '17:00',
            ]);
        }

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:6',
            'role' => 'sometimes|required|in:paciente,doctor,admin',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $updateData = [];
        if ($request->has('name')) $updateData['name'] = $request->name;
        if ($request->has('email')) $updateData['email'] = $request->email;
        if ($request->has('password')) $updateData['password'] = Hash::make($request->password);
        if ($request->has('role')) $updateData['role'] = $request->role;

        $user->update($updateData);

        // Si se actualiza el rol, manejar los perfiles
        if ($request->has('role')) {
            if ($request->role === 'paciente' && !$user->paciente) {
                Paciente::create([
                    'user_id' => $user->id,
                    'nombre' => $request->name,
                    'email' => $request->email,
                    'telefono' => $request->telefono ?? '1234567890',
                    'documento' => uniqid('doc_', true),
                    'eps_id' => $request->eps_id ?? 1,
                ]);
            } elseif ($request->role === 'doctor' && !$user->doctor) {
                Doctor::create([
                    'user_id' => $user->id,
                    'nombre' => $request->name,
                    'email' => $request->email,
                    'telefono' => $request->telefono ?? '1234567890',
                    'especialidad_id' => $request->especialidad_id ?? 1,
                    'eps_id' => $request->eps_id ?? 1,
                    'start_time' => $request->start_time ?? '09:00',
                    'end_time' => $request->end_time ?? '17:00',
                ]);
            }
        }

        return response()->json($user, 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // No permitir que un admin se elimine a sí mismo
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'No puedes eliminar tu propio usuario'], 403);
        }

        $user->delete();
        return response()->json(null, 204);
    }
}