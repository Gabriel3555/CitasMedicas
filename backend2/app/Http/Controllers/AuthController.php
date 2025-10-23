<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Paciente;
use App\Models\Doctor;
use App\Models\PasswordResetToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:paciente,doctor,admin',
            'telefono' => 'nullable|string|max:20',
            'eps_id' => 'nullable|exists:eps,id',
            'especialidad_id' => 'nullable|exists:especialidades,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        if ($request->role === 'paciente') {
            Paciente::create([
                'user_id' => $user->id,
                'nombre' => $request->name,
                'email' => $request->email,
                'telefono' => $request->telefono ?? null,
                'eps_id' => $request->eps_id ?? null,
            ]);
        } elseif ($request->role === 'doctor') {
            Doctor::create([
                'user_id' => $user->id,
                'nombre' => $request->name,
                'email' => $request->email,
                'telefono' => $request->telefono ?? null,
                'especialidad_id' => $request->especialidad_id ?? null,
                'eps_id' => $request->eps_id ?? null,
            ]);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        Log::info('Login request started', ['email' => $request->email]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::error('Login validation failed', ['errors' => $validator->errors()]);
            return response()->json($validator->errors(), 400);
        }

        $credentials = $request->only('email', 'password');

        Log::info('Attempting JWT login');
        if (!$token = JWTAuth::attempt($credentials)) {
            Log::error('Invalid credentials for login');
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        $user = Auth::user();
        Log::info('Login successful');

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Logout exitoso']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al hacer logout'], 500);
        }
    }

    public function me()
    {
        $user = Auth::user();

        if ($user->photo) {
            $user->photo_url = url('storage/' . $user->photo);
        }

        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $user->doctor_profile = $doctor;
            }
        }

        if ($user->role === 'paciente') {
            $paciente = Paciente::where('user_id', $user->id)->first();
            if ($paciente) {
                $user->paciente_profile = $paciente;
            }
        }

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'telefono' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
            $user->save();

            if ($user->role === 'paciente') {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $paciente->nombre = $request->name;
                    $paciente->save();
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if ($doctor) {
                    $doctor->nombre = $request->name;
                    $doctor->save();
                }
            }
        }

        if ($request->has('email')) {
            $user->email = $request->email;
            $user->save();

            if ($user->role === 'paciente') {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $paciente->email = $request->email;
                    $paciente->save();
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if ($doctor) {
                    $doctor->email = $request->email;
                    $doctor->save();
                }
            }
        }

        if ($request->has('telefono')) {
            if ($user->role === 'paciente') {
                $paciente = Paciente::where('user_id', $user->id)->first();
                if ($paciente) {
                    $paciente->telefono = $request->telefono;
                    $paciente->save();
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if ($doctor) {
                    $doctor->telefono = $request->telefono;
                    $doctor->save();
                }
            }
        }

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['current_password' => ['La contraseña actual es incorrecta']], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Contraseña cambiada exitosamente'
        ]);
    }

    public function adminChangeUserPassword(Request $request, $user_id)
    {
        $admin = Auth::user();

        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized - Admin access required'], 403);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::find($user_id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if ($user->id === $admin->id) {
            return response()->json(['error' => 'Use the regular change password endpoint for your own account'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'User password changed successfully',
            'user_id' => $user->id,
            'user_email' => $user->email
        ]);
    }

    public function uploadPhoto(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . $user->id . '.' . $file->getClientOriginalExtension();

            $path = $file->storeAs('avatars', $filename, 'public');

            $user->photo = 'avatars/' . $filename;
            $user->save();

            $user = User::find($user->id);

            return response()->json([
                'message' => 'Foto de perfil subida exitosamente',
                'user' => $user,
                'photo_url' => asset('storage/' . $user->photo)
            ]);
        }

        return response()->json(['error' => 'Error al subir la foto'], 500);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Si el correo existe, recibirás un enlace para restablecer tu contraseña'
            ], 200);
        }

        // Delete any existing tokens for this email
        PasswordResetToken::where('email', $request->email)->delete();

        // Create new token
        $token = Str::random(60);
        $resetToken = PasswordResetToken::create([
            'email' => $request->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Send email
        try {
            $resetUrl = "https://consuelo-unmigratory-shirlee.ngrok-free.dev/reset-password?token={$token}&email={$request->email}";
            Log::info('Sending password reset email', ['resetUrl' => $resetUrl, 'token' => $token, 'email' => $request->email]);
            Mail::send('emails.password-reset', [
                'user' => $user,
                'token' => $token,
                'email' => $request->email,
                'resetUrl' => $resetUrl
            ], function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Restablecer contraseña - Citas Médicas');
            });

            return response()->json([
                'message' => 'Si el correo existe, recibirás un enlace para restablecer tu contraseña'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error sending password reset email: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al enviar el correo de recuperación'
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $resetToken = PasswordResetToken::where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetToken) {
            return response()->json([
                'error' => 'Token inválido o expirado'
            ], 400);
        }

        if ($resetToken->isExpired()) {
            $resetToken->delete();
            return response()->json([
                'error' => 'Token expirado. Solicita un nuevo enlace de recuperación'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the used token
        $resetToken->delete();

        return response()->json([
            'message' => 'Contraseña restablecida exitosamente'
        ], 200);
    }

    public function showResetPasswordForm(Request $request)
    {
        Log::info('Show reset password form request', ['token' => $request->query('token'), 'email' => $request->query('email')]);

        $token = $request->query('token');
        $email = $request->query('email');

        if (!$token || !$email) {
            Log::error('Invalid link for reset password');
            return redirect('/')->with('error', 'Enlace inválido para restablecer contraseña');
        }

        // Verificar que el token existe y no ha expirado
        $resetToken = PasswordResetToken::where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$resetToken) {
            Log::error('Reset token not found', ['token' => $token, 'email' => $email]);
            return redirect('/')->with('error', 'Token inválido o expirado');
        }

        if ($resetToken->isExpired()) {
            Log::error('Reset token expired', ['token' => $token, 'email' => $email]);
            $resetToken->delete();
            return redirect('/')->with('error', 'Token expirado. Solicita un nuevo enlace de recuperación');
        }

        Log::info('Reset form displayed successfully', ['token' => $token, 'email' => $email]);
        return view('reset-password', [
            'token' => $token,
            'email' => $email
        ]);
    }

    public function resetPasswordWeb(Request $request)
    {
        try {
            Log::info('Reset password web request started', ['email' => $request->email, 'token' => $request->token, 'all_params' => $request->all()]);

            $validator = Validator::make($request->all(), [
                'email' => 'required|string|email',
                'token' => 'required|string',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed in resetPasswordWeb', ['errors' => $validator->errors()]);
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            Log::info('Checking reset token');
            $resetToken = PasswordResetToken::where('email', $request->email)
                ->where('token', $request->token)
                ->first();

            if (!$resetToken) {
                Log::error('Reset token not found', ['email' => $request->email, 'token' => $request->token]);
                return redirect()->back()
                    ->with('error', 'Token inválido o expirado')
                    ->withInput();
            }

            if ($resetToken->isExpired()) {
                Log::error('Reset token expired', ['email' => $request->email, 'token' => $request->token, 'created_at' => $resetToken->created_at]);
                $resetToken->delete();
                return redirect()->back()
                    ->with('error', 'Token expirado. Solicita un nuevo enlace de recuperación')
                    ->withInput();
            }

            Log::info('Finding user');
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                Log::error('User not found', ['email' => $request->email]);
                return redirect()->back()
                    ->with('error', 'Usuario no encontrado')
                    ->withInput();
            }

            Log::info('Updating password');
            $user->password = Hash::make($request->password);
            $user->save();

            // Delete the used token
            $resetToken->delete();

            Log::info('Password reset successful');
            return redirect('/')->with('success', 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.');
        } catch (\Exception $e) {
            Log::error('Exception in resetPasswordWeb: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect()->back()
                ->with('error', 'Error interno del servidor')
                ->withInput();
        }
    }

    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json([
                'message' => 'Token refrescado',
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al refrescar token'], 500);
        }
    }
}
