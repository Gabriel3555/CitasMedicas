<?php

namespace App\Http\Controllers;

use App\Models\Especialidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class EspecialidadesController extends Controller
{
    public function index()
    {
        $especialidades = Especialidad::all();
        return response()->json($especialidades);
    }

    public function show($id)
    {
        $especialidad = Especialidad::find($id);

        if (!$especialidad) {
            return response()->json(['message' => 'Especialidad not found'], 404);
        }

        return response()->json($especialidad);
    }

    public function store(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:especialidades,nombre',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $especialidad = Especialidad::create($request->all());
        return response()->json($especialidad, 201);
    }

    public function update(Request $request, $id)
    {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:especialidades,nombre,' . $id,
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $especialidad = Especialidad::find($id);

        if (!$especialidad) {
            return response()->json(['message' => 'Especialidad not found'], 404);
        }

        $especialidad->update($request->all());
        return response()->json($especialidad, 200);
    }

    public function destroy($id)
    {
        $especialidad = Especialidad::find($id);

        if (!$especialidad) {
            return response()->json(['message' => 'Especialidad not found'], 404);
        }

        $especialidad->delete();
        return response()->json(null, 204);
    }
}