<?php
namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        $validate = Validator::make($request->all(), [
            'pacientes_id' => 'required|exists:pacientes,id',
            'doctor_id'    => 'required|exists:doctores,id',
            'fecha'        => 'required|date',
            'hora'         => 'required',
        ]);


        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $cita = Cita::create($request->all());
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

}