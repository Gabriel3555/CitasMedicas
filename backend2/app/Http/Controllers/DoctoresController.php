<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class DoctoresController extends Controller
{
    public function index(Request $request) {
        $query = Doctor::with(['eps', 'especialidad']);

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
                'role' => 'doctor',
            ]);

            

            $doctorData = $request->all();
            $doctorData['user_id'] = $user->id;

            $doctor = Doctor::create($doctorData);

            

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
            
            return response()->json([
                'error' => 'Error creating doctor and user',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id) {
        

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

        

        $validate = Validator::make($request->all(), $rules);

        if ($validate->fails()) {
            
            return response()->json($validate->errors(), 400);
        }

        

        $doctor = Doctor::find($id);

        if (!$doctor) {
            
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        

        try {
            $doctor->update($request->all());
            $doctor->load(['eps', 'especialidad']);

            

            return response()->json($doctor, 200);
        } catch (\Exception $e) {
            

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
        

        $user = Auth::user();

        if (!$user) {
            
            return response()->json(['error' => 'No authenticated user'], 401);
        }

        if ($user->role !== 'doctor') {
            
            return response()->json(['error' => 'Unauthorized - User is not a doctor'], 403);
        }

        $doctor = Doctor::where('user_id', $user->id)->first();
        if (!$doctor) {
            
            return response()->json(['error' => 'Doctor profile not found'], 404);
        }

        

        $validate = Validator::make($request->all(), [
            'start_time' => 'required|string|max:255',
            'end_time' => 'required|string|max:255',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $startTime = $request->start_time;
        $endTime = $request->end_time;

        if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $startTime) ||
            !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $endTime)) {
            return response()->json(['error' => 'Formato de hora inválido. Use el formato HH:MM'], 400);
        }

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