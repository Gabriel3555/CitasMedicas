<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CitasController;
use App\Http\Controllers\DoctoresController;
use App\Http\Controllers\PacientesController;
use App\Http\Controllers\EPSController;
use App\Http\Controllers\EspecialidadesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('jwt.auth')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    // Pacientes routes
    Route::get('/pacientes', [PacientesController::class, 'index']);
    Route::post('/pacientes', [PacientesController::class, 'store']);
    Route::put('/pacientes/{id}', [PacientesController::class, 'update']);
    Route::delete('/pacientes/{id}', [PacientesController::class, 'destroy']);
    Route::get('/pacientes/{id}', [PacientesController::class, 'show']);
    Route::get('/pacientes/{id}/citas', [PacientesController::class, 'citasByPaciente']);
    Route::get('/pacientes/{id}/doctores', [PacientesController::class, 'doctoresByPaciente']);

    // Doctores routes
    Route::get('/doctores', [DoctoresController::class, 'index']);
    Route::post('/doctores', [DoctoresController::class, 'store']);
    Route::put('/doctores/{id}', [DoctoresController::class, 'update']);
    Route::delete('/doctores/{id}', [DoctoresController::class, 'destroy']);
    Route::get('/doctores/{id}', [DoctoresController::class, 'show']);
    Route::get('/doctores/{id}/citas', [DoctoresController::class, 'citasByDoctor']);
    Route::get('/doctores/{id}/pacientes', [DoctoresController::class, 'pacientesByDoctor']);

    // Citas routes
    Route::get('/citas', [CitasController::class, 'index']);
    Route::post('/citas', [CitasController::class, 'store']);
    Route::put('/citas/{id}', [CitasController::class, 'update']);
    Route::delete('/citas/{id}', [CitasController::class, 'destroy']);
    Route::get('/citas/{id}', [CitasController::class, 'show']);
    Route::get('/citas/{id}/detalle', [CitasController::class, 'citaCompleta']);

    // EPS routes
    Route::get('/eps', [EPSController::class, 'index']);
    Route::post('/eps', [EPSController::class, 'store']);
    Route::put('/eps/{id}', [EPSController::class, 'update']);
    Route::delete('/eps/{id}', [EPSController::class, 'destroy']);
    Route::get('/eps/{id}', [EPSController::class, 'show']);

    // Especialidades routes
    Route::get('/especialidades', [EspecialidadesController::class, 'index']);
    Route::post('/especialidades', [EspecialidadesController::class, 'store']);
    Route::put('/especialidades/{id}', [EspecialidadesController::class, 'update']);
    Route::delete('/especialidades/{id}', [EspecialidadesController::class, 'destroy']);
    Route::get('/especialidades/{id}', [EspecialidadesController::class, 'show']);
});

