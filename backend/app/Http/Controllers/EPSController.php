<?php

namespace App\Http\Controllers;

use App\Models\EPS;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EPSController extends Controller
{
    public function index()
    {
        $eps = EPS::all();
        return response()->json($eps);
    }

    public function show($id)
    {
        $eps = EPS::find($id);

        if (!$eps) {
            return response()->json(['message' => 'EPS not found'], 404);
        }

        return response()->json($eps);
    }

    public function store(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:eps,nombre',
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $eps = EPS::create($request->all());
        return response()->json($eps, 201);
    }

    public function update(Request $request, $id)
    {
        $validate = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:eps,nombre,' . $id,
        ]);

        if ($validate->fails()) {
            return response()->json($validate->errors(), 400);
        }

        $eps = EPS::find($id);

        if (!$eps) {
            return response()->json(['message' => 'EPS not found'], 404);
        }

        $eps->update($request->all());
        return response()->json($eps, 200);
    }

    public function destroy($id)
    {
        $eps = EPS::find($id);

        if (!$eps) {
            return response()->json(['message' => 'EPS not found'], 404);
        }

        $eps->delete();
        return response()->json(null, 204);
    }
}
