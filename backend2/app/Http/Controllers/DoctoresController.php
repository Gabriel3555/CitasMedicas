<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class DoctoresController extends Controller
{
    public function index() {
        $doctores = Doctor::with(['eps', 'especialidad'])->get();
        return response()->json($doctores);
    }

    public function show($id) {
        $doctor = Doctor::with(['eps', 'especialidad'])->find($id);
        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }
        return response()->json($doctor);
    }

    public function store(Request $request) {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:doctores,nombre',
            'telefono' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:doctores,email',
            'especialidad_id' => 'required|exists:especialidades,id',
            'eps_id' => 'required|exists:eps,id',
            'start_time' => 'nullable|string|max:255',
            'end_time' => 'nullable|string|max:255',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $doctor = Doctor::create($request->all());
        return response()->json($doctor, 201);
    }

    public function update(Request $request, $id) {
        \Log::info('Doctor update attempt', [
            'doctor_id' => $id,
            'request_data' => $request->all(),
            'request_method' => $request->method(),
            'user_agent' => $request->userAgent()
        ]);

        // Validación condicional: solo validar campos que se están actualizando
        $rules = [];

        if ($request->has('nombre')) {
            $rules['nombre'] = 'required|string|unique:doctores,nombre,' . $id;
        }
        if ($request->has('especialidad_id')) {
            $rules['especialidad_id'] = 'required|exists:especialidades,id';
        }
        if ($request->has('eps_id')) {
            $rules['eps_id'] = 'required|exists:eps,id';
        }
        if ($request->has('telefono')) {
            $rules['telefono'] = 'required|string|max:255';
        }
        if ($request->has('email')) {
            $rules['email'] = 'required|string|email|max:255|unique:doctores,email,' . $id;
        }
        if ($request->has('start_time')) {
            $rules['start_time'] = 'nullable|string|max:255';
        }
        if ($request->has('end_time')) {
            $rules['end_time'] = 'nullable|string|max:255';
        }

        \Log::info('Validation rules applied', [
            'doctor_id' => $id,
            'rules' => $rules,
            'fields_present' => array_keys($request->all())
        ]);

        $validate = Validator::make($request->all(), $rules);

        if ($validate->fails()) {
            \Log::error('Doctor update validation failed', [
                'doctor_id' => $id,
                'request_data' => $request->all(),
                'validation_errors' => $validate->errors()->toArray()
            ]);
            return response()->json($validate->errors(), 400);
        }

        \Log::info('Validation passed, looking for doctor', ['doctor_id' => $id]);

        $doctor = Doctor::find($id);

        if (!$doctor) {
            \Log::error('Doctor not found for update', ['doctor_id' => $id]);
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        \Log::info('Doctor found, attempting update', [
            'doctor_id' => $id,
            'current_data' => $doctor->toArray(),
            'update_data' => $request->all()
        ]);

        try {
            $doctor->update($request->all());
            $doctor->load(['eps', 'especialidad']);

            \Log::info('Doctor update successful', [
                'doctor_id' => $id,
                'updated_data' => $doctor->toArray()
            ]);

            return response()->json($doctor, 200);
        } catch (\Exception $e) {
            \Log::error('Doctor update failed with exception', [
                'doctor_id' => $id,
                'request_data' => $request->all(),
                'exception_message' => $e->getMessage(),
                'exception_trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error updating doctor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id) {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        $doctor->delete();
        return response()->json(null, 204);
    }


}