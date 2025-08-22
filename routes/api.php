<?php

use App\Http\Controllers\CitasController;
use App\Http\Controllers\DoctoresController;
use App\Http\Controllers\PacientesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas Pacientes
Route::get('/pacientes', [PacientesController::class, 'index']);
Route::post('/pacientes', [PacientesController::class, 'store']);
Route::put('/pacientes/{id}', [PacientesController::class, 'update']);
Route::delete('/pacientes/{id}', [PacientesController::class, 'destroy']);
Route::get('/pacientes/{id}', [PacientesController::class, 'show']);
Route::get('/pacientes/{id}/citas', [PacientesController::class, 'citasByPaciente']);
Route::get('/pacientes/{id}/doctores', [PacientesController::class, 'doctoresByPaciente']);

// Rutas Doctores
Route::get('/doctores', [DoctoresController::class, 'index']);
Route::post('/doctores', [DoctoresController::class, 'store']);
Route::put('/doctores/{id}', [DoctoresController::class, 'update']);
Route::delete('/doctores/{id}', [DoctoresController::class, 'destroy']);
Route::get('/doctores/{id}', [DoctoresController::class, 'show']);
Route::get('/doctores/{id}/citas', [DoctoresController::class, 'citasByDoctor']);
Route::get('/doctores/{id}/pacientes', [DoctoresController::class, 'pacientesByDoctor']);

// Rutas Citas
Route::get('/citas', [CitasController::class, 'index']);
Route::post('/citas', [CitasController::class, 'store']);
Route::put('/citas/{id}', [CitasController::class, 'update']);
Route::delete('/citas/{id}', [CitasController::class, 'destroy']);
Route::get('/citas/{id}', [CitasController::class, 'show']);
Route::get('/citas/{id}/detalle', [CitasController::class, 'citaCompleta']);
