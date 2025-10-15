<?php
namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
        // Verificar que el usuario tenga permisos para crear citas
        $user = Auth::user();

        if (!in_array($user->role, ['admin', 'paciente', 'doctor'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Lógica diferente según el rol del usuario
        if ($user->role === 'admin') {
            $validate = Validator::make($request->all(), [
                'pacientes_id' => 'required|exists:pacientes,id',
                'doctor_id'    => 'required|exists:doctores,id',
                'fecha'        => 'required|date',
                'hora'         => 'required|date_format:H:i:s',
            ]);

            if ($validate->fails()) {
                
                return response()->json($validate->errors(), 400);
            }

            $pacientes_id = $request->pacientes_id;
            $doctor_id = $request->doctor_id;
        } elseif ($user->role === 'paciente') {
            // Los pacientes solo pueden agendar para sí mismos
            Log::info('Paciente intentando crear cita', [
                'user_id' => $user->id,
                'request_data' => $request->all()
            ]);

            $validate = Validator::make($request->all(), [
                'doctor_id'    => 'required|exists:doctores,id',
                'fecha'        => 'required|date',
                'hora'         => 'required|date_format:H:i:s',
            ]);

            if ($validate->fails()) {
                Log::error('Validación fallida para paciente', [
                    'user_id' => $user->id,
                    'errors' => $validate->errors()
                ]);
                return response()->json($validate->errors(), 400);
            }

            $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
            Log::info('Búsqueda de perfil paciente', [
                'user_id' => $user->id,
                'paciente_found' => $paciente ? true : false,
                'paciente_id' => $paciente ? $paciente->id : null
            ]);

            if (!$paciente) {
                Log::error('Perfil de paciente no encontrado', ['user_id' => $user->id]);
                return response()->json(['error' => 'Paciente profile not found'], 404);
            }

            $pacientes_id = $paciente->id;
            $doctor_id = $request->doctor_id;
        } elseif ($user->role === 'doctor') {
            // Los doctores crean citas para sus pacientes
            $validate = Validator::make($request->all(), [
                'pacientes_id' => 'required|exists:pacientes,id',
                'fecha'        => 'required|date',
                'hora'         => 'required|date_format:H:i:s',
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

            // Verificar que la hora esté dentro del horario laboral del doctor
            if ($doctor->start_time && $doctor->end_time) {
                $appointmentTime = strtotime($request->hora);
                $startTime = strtotime($doctor->start_time);
                $endTime = strtotime($doctor->end_time);

                if ($appointmentTime < $startTime || $appointmentTime >= $endTime) {
                    return response()->json(['message' => 'La hora seleccionada está fuera de su horario laboral'], 400);
                }
            }
        }  

        $doctor = Doctor::find($doctor_id);
        
        if (!$doctor) {
            
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        // Verificar que no haya conflicto de horarios
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

        // Preparar los datos de la cita
        $citaData = $request->all();
        $citaData['pacientes_id'] = $pacientes_id;
        $citaData['doctor_id'] = $doctor_id;

        // El estado inicial depende del rol del usuario
        if ($user->role === 'paciente') {
            $citaData['status'] = 'pendiente_por_aprobador'; // Los pacientes necesitan aprobación
        } elseif ($user->role === 'doctor') {
            $citaData['status'] = 'aprobada'; // Los doctores aprueban automáticamente
        }

        Log::info('Datos de cita preparados', [
            'user_id' => $user->id,
            'role' => $user->role,
            'citaData' => $citaData
        ]);

        // Crear la cita en la base de datos
        try {
            $cita = Cita::create($citaData);
            Log::info('Cita creada exitosamente', [
                'cita_id' => $cita->id,
                'user_id' => $user->id
            ]);
            return response()->json($cita, 201);
        } catch (\Exception $e) {
            Log::error('Error al crear cita', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'citaData' => $citaData
            ]);
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function update(Request $request, $id) {
        // Buscar la cita a actualizar
        $user = Auth::user();

        $cita = Cita::find($id);
        if (!$cita) {
            return response()->json(['message' => 'Cita not found'], 404);
        }

        // Los admins pueden editar cualquier campo
        if ($user->role === 'admin') {
            $validate = Validator::make($request->all(), [
                'pacientes_id' => 'sometimes|exists:pacientes,id',
                'doctor_id'    => 'sometimes|exists:doctores,id',
                'fecha'        => 'sometimes|date',
                'hora'         => 'sometimes|date_format:H:i:s',
                'status'       => 'sometimes|in:pendiente_por_aprobador,aprobada,no_aprobado,completada,no_asistio',
            ]);

            if ($validate->fails()) {
                return response()->json($validate->errors(), 400);
            }

            $cita->update($request->all());
        } elseif ($user->role === 'doctor') {
            // Los doctores solo pueden cambiar el estado de sus propias citas
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

            // Definir las transiciones de estado permitidas
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
        // Solo admin y pacientes pueden ver horarios disponibles
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
            // Si el doctor no tiene horario configurado, no hay slots disponibles
            return response()->json(['slots' => []], 200);
        }

        $slots = [];
        $startTime = strtotime($doctor->start_time);
        $endTime = strtotime($doctor->end_time);
        // Convertir las horas del doctor a timestamps para facilitar los cálculos

        // Proceso de generación de intervalos de 30 minutos:
        // 1. Comenzar desde la hora de inicio del doctor
        // 2. Crear slots de 30 minutos hasta llegar al horario de fin
        // 3. Cada slot tiene hora de inicio y fin
        // 4. Formatear para mostrar correctamente al usuario
        
        $currentTime = $startTime;
        $slotCount = 0;
        while ($currentTime < $endTime) {
            // PASO 1: Tomar la hora actual como inicio del slot
            $slotStart = date('H:i:s', $currentTime);

            // PASO 2: Avanzar exactamente 30 minutos (1800 segundos)
            $currentTime += 30 * 60; // Sumar 30 minutos

            // PASO 3: Esta hora será el fin del slot actual
            $slotEnd = date('H:i:s', $currentTime);

            // PASO 4: Formatear para mostrar solo horas y minutos (sin segundos)
            $labelStart = date('H:i', strtotime($slotStart));
            $labelEnd = date('H:i', strtotime($slotEnd));

            // PASO 5: Solo agregar si no nos pasamos del horario del doctor
            if ($currentTime <= $endTime) {
                $slots[] = [
                    'hora' => $slotStart,           // "08:00:00" (formato completo para BD)
                    'hora_fin' => $slotEnd,         // "08:30:00" (formato completo para BD)
                    'label' => $labelStart . ' - ' . $labelEnd,  // "08:00 - 08:30" (para mostrar)
                    'disponible' => true
                ];
                $slotCount++;
            }
        }

        // PASO 6: Verificar citas existentes que ocupen estos horarios
        $existingAppointments = Cita::where('doctor_id', $request->doctor_id)
                                     ->where('fecha', $request->fecha)
                                     ->pluck('hora')
                                     ->map(function($h) { return date('H:i:s', strtotime($h)); })
                                     ->toArray();

        // PASO 7: Marcar slots ocupados como no disponibles
        $occupiedCount = 0;
        foreach ($slots as &$slot) {
            if (in_array($slot['hora'], $existingAppointments)) {
                $slot['disponible'] = false; // Este horario ya está ocupado
                $occupiedCount++;
            }
        }

        // PASO 8: Filtrar solo los slots disponibles
        $availableSlots = array_filter($slots, function($slot) {
            return $slot['disponible']; // Solo retornar slots disponibles
        });

        $finalSlots = array_values($availableSlots);

        // PASO 9: Retornar slots disponibles con índices limpios
        // Resultado: Array de horarios disponibles en intervalos de 30 minutos
        // Ejemplo: ["08:00:00", "08:30:00", "09:00:00", ...] (solo los disponibles)
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