<?php

namespace App\Http\Controllers;

use App\Models\pacientes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class PacientesController extends Controller
{
    public function index() {
        $pacientes = pacientes::all(); // Mayúscula
        return response()->json($pacientes);
    }

    public function show($id) {
        $paciente = pacientes::find($id);
        if (!$paciente) {
            return response()->json(['message' => 'paciente not found'], 404);
        }
        return response()->json($paciente);
    }

    public function store(Request $request) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre',
            'especialidad' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:pacientes,email',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $paciente = pacientes::create($request->all());
        return response()->json($paciente, 201);
    }

    public function update(Request $request, $id) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre,'.$id, // Excluir el registro actual
            'especialidad' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:pacientes,email,'.$id, // Excluir el registro actual
        ]);

        $paciente = pacientes::find($id);

        if (!$paciente) {
            return response()->json(['message' => 'paciente not found'], 404);
        }

        $paciente->update($request->all());
        return response()->json($paciente, 200);
    }

    public function destroy($id) {
        $paciente = pacientes::find($id);

        if (!$paciente) {
            return response()->json(['message' => 'paciente not found'], 404);
        }

        $paciente->delete();
        return response()->json(null, 204);
    }

    public function citasByPaciente($id)
    {
        $paciente = pacientes::with('citas')->find($id);

        if (!$paciente) {
            return response()->json(['message' => 'Paciente not found'], 404);
        }

        return response()->json($paciente->citas, 200);
    }

    public function doctoresByPaciente($id)
    {
        $paciente = pacientes::with('citas.doctor')->find($id);

        if (!$paciente) {
            return response()->json(['message' => 'Paciente not found'], 404);
        }

        $doctores = $paciente->citas->pluck('doctor')->unique('id')->values();

        return response()->json($doctores, 200);
    }

}
