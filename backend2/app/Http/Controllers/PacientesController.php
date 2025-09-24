<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;


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
        \Log::info('PacientesController@store - Request received', [
            'params' => $request->all(),
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role ?? 'unknown'
        ]);

        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre',
            'email' => 'required|string|email|max:255|unique:pacientes,email',
            'telefono' => 'required|string|max:255',
            'eps_id' => 'required|exists:eps,id',
        ]);

        if ($validate->fails()) {
            \Log::error('PacientesController@store - Validation failed', [
                'errors' => $validate->errors(),
                'params' => $request->all()
            ]);
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validate->errors()
            ], 400);
        }

        \Log::info('PacientesController@store - Validation passed, creating paciente');

        try {
            $paciente = Paciente::create($request->all());
            \Log::info('PacientesController@store - Paciente created successfully', [
                'paciente_id' => $paciente->id,
                'paciente_data' => $paciente->toArray()
            ]);
            return response()->json($paciente, 201);
        } catch (\Exception $e) {
            \Log::error('PacientesController@store - Exception during creation', [
                'exception_message' => $e->getMessage(),
                'exception_trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'error' => 'Error creating paciente',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:pacientes,nombre,'.$id, // Excluir el registro actual
            'email' => 'required|string|email|max:255|unique:pacientes,email,'.$id, // Excluir el registro actual
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