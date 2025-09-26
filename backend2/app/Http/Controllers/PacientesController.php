<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


class PacientesController extends Controller
{
    public function index() {
        $pacientes = Paciente::with('eps')->get();
        return response()->json($pacientes);
    }

    public function show($id) {
        $paciente = Paciente::with('eps')->find($id);
        if (!$paciente) {
            return response()->json(['message' => 'paciente not found'], 404);
        }
        return response()->json($paciente);
    }

    public function store(Request $request) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre',
            'email' => 'required|string|email|max:255|unique:pacientes,email|unique:users,email',
            'telefono' => 'required|string|max:255',
            'eps_id' => 'required|exists:eps,id',
        ]);

        if ($validate->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validate->errors()
            ], 400);
        }

        try {
            $defaultPassword = 'password123';
            $user = User::create([
                'name' => $request->nombre,
                'email' => $request->email,
                'password' => Hash::make($defaultPassword),
                'role' => 'paciente',
            ]);

            $pacienteData = $request->all();
            $pacienteData['user_id'] = $user->id;

            $paciente = Paciente::create($pacienteData);

            $paciente->load('eps');
            return response()->json([
                'paciente' => $paciente,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'default_password' => $defaultPassword
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error creating paciente and user',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre,'.$id,
            'email' => 'required|string|email|max:255|unique:pacientes,email,'.$id,
            'telefono' => 'required|string|max:255',
            'eps_id' => 'required|exists:eps,id',
        ]);

        $paciente = Paciente::find($id);

        if (!$paciente) {
            return response()->json(['message' => 'paciente not found'], 404);
        }

        $paciente->update($request->all());
        return response()->json($paciente, 200);
    }

    public function destroy($id) {
        $paciente = Paciente::find($id);

        if (!$paciente) {
            return response()->json(['message' => 'paciente not found'], 404);
        }

        $paciente->delete();
        return response()->json(null, 204);
    }


    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $limit = $request->get('limit', 10);

        if (strlen($query) < 2) {
            return response()->json(['message' => 'Query must be at least 2 characters'], 400);
        }

        $pacientes = Paciente::where('nombre', 'LIKE', '%' . $query . '%')
                            ->orWhere('email', 'LIKE', '%' . $query . '%')
                            ->with('eps')
                            ->limit($limit)
                            ->get();

        return response()->json($pacientes, 200);
    }

}