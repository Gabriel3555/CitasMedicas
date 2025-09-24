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

        // Solo administradores pueden ver citas
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Administradores ven todas las citas
        $citas = Cita::with(['paciente', 'doctor'])->get();
        return response()->json($citas, 200);
    }

    public function show($id) {
        $user = Auth::user();

        // Solo administradores pueden ver citas individuales
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
        \Log::info('CitasController@store - Request received', [
            'params' => $request->all(),
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role ?? 'unknown'
        ]);

        $user = Auth::user();

        // Solo administradores pueden crear citas
        if ($user->role !== 'admin') {
            \Log::warning('CitasController@store - Unauthorized access', [
                'user_id' => $user->id,
                'user_role' => $user->role
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Los administradores pueden crear citas especificando paciente y doctor
        $validate = Validator::make($request->all(), [
            'pacientes_id' => 'required|exists:pacientes,id',
            'doctor_id'    => 'required|exists:doctores,id',
            'fecha'        => 'required|date',
            'hora'         => 'required|date_format:H:i',
        ]);

        if ($validate->fails()) {
            \Log::error('CitasController@store - Validation failed', [
                'errors' => $validate->errors(),
                'params' => $request->all()
            ]);
            return response()->json($validate->errors(), 400);
        }

        $pacientes_id = $request->pacientes_id;
        $doctor_id = $request->doctor_id;

        \Log::info('CitasController@store - Validation passed, processing appointment', [
            'pacientes_id' => $pacientes_id,
            'doctor_id' => $doctor_id,
            'fecha' => $request->fecha,
            'hora' => $request->hora
        ]);

        // Verificar que el doctor existe y obtener su horario
        $doctor = Doctor::find($doctor_id);
        \Log::info('CitasController@store - Doctor lookup', [
            'doctor_id' => $doctor_id,
            'doctor_found' => $doctor ? true : false,
            'doctor_schedule' => $doctor ? ['start_time' => $doctor->start_time, 'end_time' => $doctor->end_time] : null
        ]);

        if (!$doctor) {
            \Log::warning('CitasController@store - Doctor not found', [
                'doctor_id' => $doctor_id
            ]);
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        // Verificar que el slot esté disponible (fecha + hora)
        $existingCita = Cita::where('doctor_id', $doctor_id)
                             ->where('fecha', $request->fecha)
                             ->where('hora', $request->hora)
                             ->first();

        \Log::info('CitasController@store - Slot availability check', [
            'doctor_id' => $doctor_id,
            'fecha' => $request->fecha,
            'hora' => $request->hora,
            'slot_occupied' => $existingCita ? true : false,
            'existing_cita_id' => $existingCita ? $existingCita->id : null
        ]);

        if ($existingCita) {
            \Log::warning('CitasController@store - Slot already occupied', [
                'existing_cita_id' => $existingCita->id,
                'conflicting_appointment' => [
                    'pacientes_id' => $existingCita->pacientes_id,
                    'doctor_id' => $existingCita->doctor_id,
                    'fecha' => $existingCita->fecha,
                    'hora' => $existingCita->hora
                ]
            ]);
            return response()->json(['message' => 'Este horario ya está ocupado'], 409);
        }

        // Validar que la hora esté dentro del horario laboral del doctor
        if ($doctor->start_time && $doctor->end_time) {
            $appointmentTime = strtotime($request->hora);
            $startTime = strtotime($doctor->start_time);
            $endTime = strtotime($doctor->end_time);

            \Log::info('CitasController@store - Schedule validation', [
                'appointment_time' => $request->hora,
                'appointment_timestamp' => $appointmentTime,
                'doctor_start_time' => $doctor->start_time,
                'doctor_start_timestamp' => $startTime,
                'doctor_end_time' => $doctor->end_time,
                'doctor_end_timestamp' => $endTime,
                'is_within_schedule' => ($appointmentTime >= $startTime && $appointmentTime < $endTime)
            ]);

            if ($appointmentTime < $startTime || $appointmentTime >= $endTime) {
                \Log::warning('CitasController@store - Appointment time outside doctor schedule', [
                    'appointment_time' => $request->hora,
                    'doctor_schedule' => [$doctor->start_time, $doctor->end_time]
                ]);
                return response()->json(['message' => 'La hora seleccionada está fuera del horario laboral del doctor'], 400);
            }
        } else {
            \Log::info('CitasController@store - Doctor has no schedule configured, skipping schedule validation', [
                'doctor_id' => $doctor->id
            ]);
        }

        $citaData = $request->all();
        $citaData['pacientes_id'] = $pacientes_id;
        $citaData['doctor_id'] = $doctor_id;
        $citaData['status'] = 'pending';

        \Log::info('CitasController@store - Creating appointment', [
            'cita_data' => $citaData
        ]);

        $cita = Cita::create($citaData);

        \Log::info('CitasController@store - Appointment created successfully', [
            'cita_id' => $cita->id,
            'cita_data' => $cita->toArray()
        ]);

        return response()->json($cita, 201);
    }

    public function update(Request $request, $id) {
        $user = Auth::user();

        // Solo administradores pueden actualizar citas
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validate = Validator::make($request->all(), [
            'pacientes_id' => 'required|exists:pacientes,id',
            'doctor_id'    => 'required|exists:doctores,id',
            'fecha'        => 'required|date',
            'status'       => 'nullable|in:pending,accepted,rejected,completed,cancelled',
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
        $user = Auth::user();

        // Solo administradores pueden eliminar citas
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

        // Solo administradores pueden ver citas completas
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cita = Cita::with(['paciente', 'doctor'])->find($id);

        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        return response()->json($cita, 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();

        // Solo administradores pueden actualizar el status de citas
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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

        $cita->update(['status' => $request->status]);
        return response()->json($cita, 200);
    }

    public function getAvailableSlots(Request $request)
    {
        \Log::info('CitasController@getAvailableSlots - Request received', [
            'params' => $request->all(),
            'user_id' => Auth::id(),
            'user_role' => Auth::user()->role ?? 'unknown'
        ]);

        $user = Auth::user();

        // Solo administradores pueden ver slots disponibles
        if ($user->role !== 'admin') {
            \Log::warning('CitasController@getAvailableSlots - Unauthorized access', [
                'user_id' => $user->id,
                'user_role' => $user->role
            ]);
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validate = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctores,id',
            'fecha'     => 'required|date',
        ]);

        if ($validate->fails()) {
            \Log::error('CitasController@getAvailableSlots - Validation failed', [
                'errors' => $validate->errors(),
                'params' => $request->all()
            ]);
            return response()->json($validate->errors(), 400);
        }

        $doctor = Doctor::find($request->doctor_id);
        \Log::info('CitasController@getAvailableSlots - Doctor lookup', [
            'doctor_id' => $request->doctor_id,
            'doctor_found' => $doctor ? true : false,
            'doctor_schedule' => $doctor ? ['start_time' => $doctor->start_time, 'end_time' => $doctor->end_time] : null
        ]);

        if (!$doctor) {
            \Log::warning('CitasController@getAvailableSlots - Doctor not found', [
                'doctor_id' => $request->doctor_id
            ]);
            return response()->json(['message' => 'Doctor not found'], 404);
        }

        // Si el doctor no tiene horario configurado, devolver array vacío
        if (!$doctor->start_time || !$doctor->end_time) {
            \Log::info('CitasController@getAvailableSlots - Doctor has no schedule configured', [
                'doctor_id' => $doctor->id,
                'start_time' => $doctor->start_time,
                'end_time' => $doctor->end_time
            ]);
            return response()->json(['slots' => []], 200);
        }

        // Generar slots de 30 minutos dentro del horario laboral
        $slots = [];
        $startTime = strtotime($doctor->start_time);
        $endTime = strtotime($doctor->end_time);
        \Log::info('CitasController@getAvailableSlots - Generating slots', [
            'start_time_str' => $doctor->start_time,
            'end_time_str' => $doctor->end_time,
            'start_timestamp' => $startTime,
            'end_timestamp' => $endTime
        ]);

        $currentTime = $startTime;
        $slotCount = 0;
        while ($currentTime < $endTime) {
            $slotStart = date('H:i', $currentTime);
            $currentTime += 30 * 60; // Agregar 30 minutos
            $slotEnd = date('H:i', $currentTime);

            // Solo agregar si no excede el horario de fin
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

        \Log::info('CitasController@getAvailableSlots - Slots generated', [
            'total_slots_generated' => $slotCount,
            'slots' => $slots
        ]);

        // Obtener citas existentes para esta fecha y doctor
        $existingAppointments = Cita::where('doctor_id', $request->doctor_id)
                                    ->where('fecha', $request->fecha)
                                    ->pluck('hora')
                                    ->toArray();

        \Log::info('CitasController@getAvailableSlots - Existing appointments found', [
            'doctor_id' => $request->doctor_id,
            'fecha' => $request->fecha,
            'existing_appointments' => $existingAppointments
        ]);

        // Marcar slots ocupados
        $occupiedCount = 0;
        foreach ($slots as &$slot) {
            if (in_array($slot['hora'], $existingAppointments)) {
                $slot['disponible'] = false;
                $occupiedCount++;
            }
        }

        \Log::info('CitasController@getAvailableSlots - Slots marked as occupied', [
            'occupied_slots' => $occupiedCount,
            'total_slots_after_filtering' => count($slots)
        ]);

        // Filtrar solo slots disponibles
        $availableSlots = array_filter($slots, function($slot) {
            return $slot['disponible'];
        });

        $finalSlots = array_values($availableSlots);
        \Log::info('CitasController@getAvailableSlots - Final available slots', [
            'available_slots_count' => count($finalSlots),
            'available_slots' => $finalSlots
        ]);

        return response()->json(['slots' => $finalSlots], 200);
    }


}