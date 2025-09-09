<?php

namespace App\Http\Controllers;

use App\Models\doctores;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class DoctoresController extends Controller
{
    public function index() {
        $doctores = doctores::all();
        return response()->json($doctores);
    }

    public function show($id) {
        $doctor = doctores::find($id);
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }
        return response()->json($doctor);
    }

    public function store(Request $request) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:doctores,nombre',
            'especialidad' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:doctores,email',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $doctor = doctores::create($request->all());
        return response()->json($doctor, 201);
    }

    public function update(Request $request, $id) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:doctores,nombre',
            'especialidad' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:doctores,email',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $doctor = doctores::find($id);

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $doctor->update($request->all());
        return response()->json($doctor, 200);
    }

    public function destroy($id) {
        $doctor = doctores::find($id);

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $doctor->delete();
        return response()->json(null, 204);
    }

    public function citasByDoctor($id)
    {
        $doctor = doctores::with('citas')->find($id);

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        return response()->json($doctor->citas, 200);
    }

    public function pacientesByDoctor($id)
    {
        $doctor = doctores::with('citas.paciente')->find($id);

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        // Solo devolver pacientes sin repetir
        $pacientes = $doctor->citas->pluck('paciente')->unique('id')->values();

        return response()->json($pacientes, 200);
    }

}
