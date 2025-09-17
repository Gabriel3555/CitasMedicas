<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class PacientesController extends Controller
{
    public function index() {
        $pacientes = Paciente::all();
        return response()->json($pacientes);
    }

    public function show($id) {
        $paciente = Paciente::find($id);
        if (!$paciente) {
            return response()->json(['message' => 'paciente not found'], 404);
        }
        return response()->json($paciente);
    }

    public function store(Request $request) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre',
            'email' => 'required|string|email|max:255|unique:pacientes,email',
            'telefono' => 'required|string|max:255',
            'documento' => 'required|string|unique:pacientes,documento',
            'eps_id' => 'required|exists:eps,id',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $paciente = Paciente::create($request->all());
        return response()->json($paciente, 201);
    }

    public function update(Request $request, $id) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre,'.$id, // Excluir el registro actual
            'email' => 'required|string|email|max:255|unique:pacientes,email,'.$id, // Excluir el registro actual
            'telefono' => 'required|string|max:255',
            'documento' => 'required|string|unique:pacientes,documento,'.$id, // Excluir el registro actual
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

    public function citasByPaciente($id)
    {
        $paciente = Paciente::with('citas')->find($id);

        if (!$paciente) {
            return response()->json(['message' => 'Paciente not found'], 404);
        }

        return response()->json($paciente->citas, 200);
    }

    public function doctoresByPaciente($id)
    {
        $paciente = Paciente::with('citas.doctor')->find($id);

        if (!$paciente) {
            return response()->json(['message' => 'Paciente not found'], 404);
        }

        $doctores = $paciente->citas->pluck('doctor')->unique('id')->values();

        return response()->json($doctores, 200);
    }

}