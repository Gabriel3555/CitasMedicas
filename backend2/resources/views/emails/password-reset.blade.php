<!DOCTYPE html>
<html>
<head>
    <title>Restablecer Contraseña - Citas Médicas</title>
</head>
<body>
    <h2>Restablecer Contraseña</h2>
    <p>Hola {{ $user->name }},</p>
    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
    <p><a href="{{ $resetUrl }}">Restablecer Contraseña</a></p>
    <p>Si no puedes hacer clic en el enlace, copia y pega la siguiente URL en tu navegador:</p>
    <p>{{ $resetUrl }}</p>
    <p>Este enlace expirará en 1 hora.</p>
    <p>Si no solicitaste este restablecimiento, ignora este correo.</p>
    <p>Saludos,<br>Equipo de Citas Médicas</p>
</body>
</html>