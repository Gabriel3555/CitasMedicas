<?php
namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CitasController extends Controller
{

    public function index() {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $citas = Cita::with(['paciente', 'doctor'])->get();
        return response()->json($citas, 200);
    }

    public function show($id) {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cita = Cita::with(['paciente', 'doctor'])->find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        return response()->json($cita, 200);
    }


    public function store(Request $request) {
        $user = Auth::user();

        if (!in_array($user->role, ['admin', 'paciente', 'doctor'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->role === 'admin') {
            $validate = Validator::make($request->all(), [
                'pacientes_id' => 'required|exists:pacientes,id',
                'doctor_id'    => 'required|exists:doctores,id',
                'fecha'        => 'required|date',
                'hora'         => 'required|date_format:H:i',
            ]);

            if ($validate->fails()) {
                
                return response()->json($validate->errors(), 400);
            }

            $pacientes_id = $request->pacientes_id;
            $doctor_id = $request->doctor_id;
        } elseif ($user->role === 'paciente') {
            $validate = Validator::make($request->all(), [
                'doctor_id'    => 'required|exists:doctores,id',
                'fecha'        => 'required|date',
                'hora'         => 'required|date_format:H:i',
            ]);

            if ($validate->fails()) {
                
                return response()->json($validate->errors(), 400);
            }

            $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
            if (!$paciente) {
                
                return response()->json(['error' => 'Paciente profile not found'], 404);
            }

            $pacientes_id = $paciente->id;
            $doctor_id = $request->doctor_id;
        } elseif ($user->role === 'doctor') {
            $validate = Validator::make($request->all(), [
                'pacientes_id' => 'required|exists:pacientes,id',
                'fecha'        => 'required|date',
                'hora'         => 'required|date_format:H:i',
            ]);

            if ($validate->fails()) {
                
                return response()->json($validate->errors(), 400);
            }

            $doctor = \App\Models\Doctor::where('user_id', $user->id)->first();
            if (!$doctor) {
                
                return response()->json(['error' => 'Doctor profile not found'], 404);
            }

            $pacientes_id = $request->pacientes_id;
            $doctor_id = $doctor->id;

            if ($doctor->start_time && $doctor->end_time) {
                $appointmentTime = strtotime($request->hora);
                $startTime = strtotime($doctor->start_time);
                $endTime = strtotime($doctor->end_time);

                

                if ($appointmentTime < $startTime || $appointmentTime >= $endTime) {
                    
                    return response()->json(['message' => 'La hora seleccionada está fuera de su horario laboral'], 400);
                }
            } else {
                
            }
        }

        

        $doctor = Doctor::find($doctor_id);
        

        if (!$doctor) {
            
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        $existingCita = Cita::where('doctor_id', $doctor_id)
                              ->where('fecha', $request->fecha)
                              ->where('hora', $request->hora)
                              ->first();

        

        if ($existingCita) {
            
            return response()->json(['message' => 'Este horario ya está ocupado'], 409);
        }

        if ($doctor->start_time && $doctor->end_time) {
            $appointmentTime = strtotime($request->hora);
            $startTime = strtotime($doctor->start_time);
            $endTime = strtotime($doctor->end_time);

            

            if ($appointmentTime < $startTime || $appointmentTime >= $endTime) {
                
                return response()->json(['message' => 'La hora seleccionada está fuera del horario laboral del doctor'], 400);
            }
        } else {
            
        }

        $citaData = $request->all();
        $citaData['pacientes_id'] = $pacientes_id;
        $citaData['doctor_id'] = $doctor_id;

        if ($user->role === 'paciente') {
            $citaData['status'] = 'pendiente_por_aprobador';
        } elseif ($user->role === 'doctor') {
            $citaData['status'] = 'aprobada';
        }

        

        $cita = Cita::create($citaData);

        

        return response()->json($cita, 201);
    }

    public function update(Request $request, $id) {
        $user = Auth::user();

        $cita = Cita::find($id);
        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        if ($user->role === 'admin') {
            $validate = Validator::make($request->all(), [
                'pacientes_id' => 'sometimes|exists:pacientes,id',
                'doctor_id'    => 'sometimes|exists:doctores,id',
                'fecha'        => 'sometimes|date',
                'hora'         => 'sometimes|date_format:H:i',
                'status'       => 'sometimes|in:pendiente_por_aprobador,aprobada,no_aprobado,completada,no_asistio',
            ]);

            if ($validate->fails()) {
                return response()->json($validate->errors(), 400);
            }

            $cita->update($request->all());
        } elseif ($user->role === 'doctor') {
            $doctor = \App\Models\Doctor::where('user_id', $user->id)->first();
            if (!$doctor || $cita->doctor_id !== $doctor->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validate = Validator::make($request->all(), [
                'status' => 'required|in:aprobada,no_aprobado,completada,no_asistio',
            ]);

            if ($validate->fails()) {
                return response()->json($validate->errors(), 400);
            }

            $currentStatus = $cita->status;
            $newStatus = $request->status;

            $allowedTransitions = [
                'pendiente_por_aprobador' => ['aprobada', 'no_aprobado'],
                'aprobada' => ['completada', 'no_asistio'],
            ];

            if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus])) {
                return response()->json(['error' => 'Transición de estado no permitida. Una vez que la cita está completada o marcada como no asistió, no se puede cambiar el estado.'], 400);
            }

            $cita->update(['status' => $newStatus]);
        } else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($cita, 200);
    }


    public function destroy($id) {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cita = Cita::find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        $cita->delete();
        return response()->json(null, 204);
    }

    public function citaCompleta($id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cita = Cita::with(['paciente', 'doctor'])->find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        return response()->json($cita, 200);
    }


    public function getAvailableSlots(Request $request)
    {
        

        $user = Auth::user();

        if (!in_array($user->role, ['admin', 'paciente'])) {
            
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validate = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctores,id',
            'fecha'     => 'required|date',
        ]);

        if ($validate->fails()) {
            
            return response()->json($validate->errors(), 400);
        }

        $doctor = Doctor::find($request->doctor_id);
        

        if (!$doctor) {
            
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        if (!$doctor->start_time || !$doctor->end_time) {
            
            return response()->json(['slots' => []], 200);
        }

        $slots = [];
        $startTime = strtotime($doctor->start_time);
        $endTime = strtotime($doctor->end_time);
        

        $currentTime = $startTime;
        $slotCount = 0;
        while ($currentTime < $endTime) {
            $slotStart = date('H:i', $currentTime);
            $currentTime += 30 * 60;
            $slotEnd = date('H:i', $currentTime);

            if ($currentTime <= $endTime) {
                $slots[] = [
                    'hora' => $slotStart,
                    'hora_fin' => $slotEnd,
                    'label' => $slotStart . ' - ' . $slotEnd,
                    'disponible' => true
                ];
                $slotCount++;
            }
        }

        

        $existingAppointments = Cita::where('doctor_id', $request->doctor_id)
                                    ->where('fecha', $request->fecha)
                                    ->pluck('hora')
                                    ->toArray();

        

        $occupiedCount = 0;
        foreach ($slots as &$slot) {
            if (in_array($slot['hora'], $existingAppointments)) {
                $slot['disponible'] = false;
                $occupiedCount++;
            }
        }

        

        $availableSlots = array_filter($slots, function($slot) {
            return $slot['disponible'];
        });

        $finalSlots = array_values($availableSlots);
        

        return response()->json(['slots' => $finalSlots], 200);
    }

    public function getMyCitas() {
        $user = Auth::user();

        if ($user->role !== 'paciente') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
        if (!$paciente) {
            return response()->json(['error' => 'Paciente profile not found'], 404);
        }

        $citas = Cita::where('pacientes_id', $paciente->id)
                    ->with(['doctor', 'paciente'])
                    ->orderBy('fecha', 'desc')
                    ->orderBy('hora', 'desc')
                    ->get();

        return response()->json($citas, 200);
    }

    public function getMyCitasDoctor() {
        $user = Auth::user();

        if ($user->role !== 'doctor') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $doctor = \App\Models\Doctor::where('user_id', $user->id)->first();
        if (!$doctor) {
            return response()->json(['error' => 'Doctor profile not found'], 404);
        }

        $citas = Cita::where('doctor_id', $doctor->id)
                    ->with(['doctor', 'paciente'])
                    ->orderBy('fecha', 'desc')
                    ->orderBy('hora', 'desc')
                    ->get();

        return response()->json($citas, 200);
    }

}