<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class DoctoresController extends Controller
{
    public function index(Request $request) {
        $query = Doctor::with(['eps', 'especialidad']);

        // Filter by specialty if provided
        if ($request->has('especialidad_id') && $request->especialidad_id) {
            $query->where('especialidad_id', $request->especialidad_id);
        }

        $doctores = $query->get();
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
        \Log::info('DoctoresController@store - Request received', [
            'params' => $request->all(),
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role ?? 'unknown'
        ]);

        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|unique:doctores,nombre',
            'telefono' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:doctores,email|unique:users,email',
            'especialidad_id' => 'required|exists:especialidades,id',
            'eps_id' => 'required|exists:eps,id',
            'start_time' => 'nullable|string|max:255',
            'end_time' => 'nullable|string|max:255',
        ]);

        if ($validate->fails()) {
            \Log::error('DoctoresController@store - Validation failed', [
                'errors' => $validate->errors(),
                'params' => $request->all()
            ]);
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validate->errors()
            ], 400);
        }

        \Log::info('DoctoresController@store - Validation passed, creating user and doctor');

        try {
            // Create user account first
            $defaultPassword = 'password123'; // Default password for doctors
            $user = User::create([
                'name' => $request->nombre,
                'email' => $request->email,
                'password' => Hash::make($defaultPassword),
                'role' => 'doctor',
            ]);

            \Log::info('DoctoresController@store - User created successfully', [
                'user_id' => $user->id,
                'user_email' => $user->email
            ]);

            // Create doctor linked to the user
            $doctorData = $request->all();
            $doctorData['user_id'] = $user->id;

            $doctor = Doctor::create($doctorData);

            \Log::info('DoctoresController@store - Doctor created successfully', [
                'doctor_id' => $doctor->id,
                'user_id' => $user->id,
                'doctor_data' => $doctor->toArray()
            ]);

            // Return doctor with user info
            $doctor->load(['eps', 'especialidad']);
            return response()->json([
                'doctor' => $doctor,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'default_password' => $defaultPassword
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('DoctoresController@store - Exception during creation', [
                'exception_message' => $e->getMessage(),
                'exception_trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'error' => 'Error creating doctor and user',
                'message' => $e->getMessage()
            ], 500);
        }
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

    public function updateMySchedule(Request $request) {
        \Log::info('updateMySchedule called', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role ?? 'no user',
            'request_data' => $request->all()
        ]);

        $user = Auth::user();

        if (!$user) {
            \Log::error('No authenticated user');
            return response()->json(['error' => 'No authenticated user'], 401);
        }

        if ($user->role !== 'doctor') {
            \Log::error('User is not a doctor', ['role' => $user->role]);
            return response()->json(['error' => 'Unauthorized - User is not a doctor'], 403);
        }

        // Obtener el doctor correspondiente al usuario autenticado
        $doctor = Doctor::where('user_id', $user->id)->first();
        if (!$doctor) {
            \Log::error('Doctor profile not found for user', ['user_id' => $user->id]);
            return response()->json(['error' => 'Doctor profile not found'], 404);
        }

        \Log::info('Doctor found', ['doctor_id' => $doctor->id]);

        $validate = Validator::make($request->all(), [
            'start_time' => 'required|string|max:255',
            'end_time' => 'required|string|max:255',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        // Validar formato de hora
        $startTime = $request->start_time;
        $endTime = $request->end_time;

        if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $startTime) ||
            !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $endTime)) {
            return response()->json(['error' => 'Formato de hora inválido. Use el formato HH:MM'], 400);
        }

        // Validar que la hora de inicio sea anterior a la hora de fin
        $start = strtotime($startTime);
        $end = strtotime($endTime);

        if ($start >= $end) {
            return response()->json(['error' => 'La hora de inicio debe ser anterior a la hora de fin'], 400);
        }

        try {
            $doctor->update([
                'start_time' => $startTime,
                'end_time' => $endTime,
            ]);

            return response()->json([
                'message' => 'Horario actualizado exitosamente',
                'doctor' => $doctor
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al actualizar horario',
                'message' => $e->getMessage()
            ], 500);
        }
    }


}