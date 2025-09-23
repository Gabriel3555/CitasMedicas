<?php
namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CitasController extends Controller
{

    public function index() {
        $citas = Cita::all();
        return response()->json($citas, 200);
    }

    public function show($id) {
        $cita = Cita::find($id);
        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }
        return response()->json($cita, 200);
    }


    public function store(Request $request) {
        $user = Auth::user();

        // Validaciones diferentes según el rol
        if ($user->role === 'paciente') {
            $validate = Validator::make($request->all(), [
                'doctor_id'    => 'required|exists:doctores,id',
                'fecha'        => 'required|date',
                'hora'         => 'required',
            ]);

            if ($validate->fails()) {
                return response()->json($validate->errors(), 400);
            }

            $paciente = $user->paciente;
            if (!$paciente) {
                return response()->json(['error' => 'Paciente not found'], 404);
            }

            $pacientes_id = $paciente->id;
        } elseif ($user->role === 'doctor') {
            $validate = Validator::make($request->all(), [
                'pacientes_id' => 'required|exists:pacientes,id',
                'fecha'        => 'required|date',
                'hora'         => 'required',
            ]);

            if ($validate->fails()) {
                return response()->json($validate->errors(), 400);
            }

            $pacientes_id = $request->pacientes_id;
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Verificar disponibilidad del doctor
        $doctor_id = $user->role === 'paciente' ? $request->doctor_id : $user->doctor->id;

        $existingCita = Cita::where('doctor_id', $doctor_id)
                            ->where('fecha', $request->fecha)
                            ->where('hora', $request->hora)
                            ->first();

        if ($existingCita) {
            return response()->json(['message' => 'El doctor no está disponible en esa fecha y hora'], 409);
        }

        $citaData = $request->all();
        $citaData['pacientes_id'] = $pacientes_id;
        $citaData['doctor_id'] = $doctor_id;
        $citaData['status'] = 'pending';

        $cita = Cita::create($citaData);
        return response()->json($cita, 201);
    }

    public function update(Request $request, $id) {
        $validate = Validator::make($request->all(), [
            'pacientes_id' => 'required|exists:pacientes,id',
            'doctor_id'    => 'required|exists:doctores,id',
            'fecha'        => 'required|date',
            'hora'         => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }


        $cita = Cita::find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        $cita->update($request->all());
        return response()->json($cita, 200);
    }


    public function destroy($id) {
        $cita = Cita::find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        $cita->delete();
        return response()->json(null, 204);
    }

    public function citaCompleta($id)
    {
        $cita = Cita::with(['paciente', 'doctor'])->find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        return response()->json($cita, 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $validate = Validator::make($request->all(), [
            'status' => 'required|in:pending,accepted,rejected,completed,cancelled',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $cita = Cita::find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        // Check if user is the doctor
        $user = Auth::user();
        if (!$user || $user->role !== 'doctor') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $doctor = $user->doctor;
        if (!$doctor || $doctor->id !== $cita->doctor_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cita->update(['status' => $request->status]);
        return response()->json($cita, 200);
    }

    public function myCitasDoctor()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'doctor') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $doctor = $user->doctor;
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        $citas = Cita::where('doctor_id', $doctor->id)->with(['doctor', 'paciente'])->get();
        return response()->json($citas, 200);
    }

    public function myCitas()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'paciente') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $paciente = $user->paciente;
        if (!$paciente) {
            return response()->json(['error' => 'Paciente not found'], 404);
        }

        $citas = Cita::where('pacientes_id', $paciente->id)->with(['doctor', 'paciente'])->get();
        return response()->json($citas, 200);
    }

}