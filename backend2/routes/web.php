<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Rutas para restablecimiento de contraseña web (DEBEN SER PÚBLICAS)
Route::get('/reset-password', [AuthController::class, 'showResetPasswordForm'])
    ->middleware('web')
    ->name('password.reset.form');

Route::post('/reset-password', [AuthController::class, 'resetPasswordWeb'])
    ->middleware('web')
    ->name('password.reset');

Route::get('/password-reset-success', function () {
    return view('password-reset-success');
})->middleware('web')->name('password.reset.success');