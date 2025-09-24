<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


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