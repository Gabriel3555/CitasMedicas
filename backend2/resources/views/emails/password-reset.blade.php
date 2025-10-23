<!DOCTYPE html>
<html>
<head>
    <title>Restablecer Contraseña - Citas Médicas</title>
    <style>
        body {
            font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
            background-color: #f8f9fa;
            color: #333;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #007AFF;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        p {
            margin-bottom: 16px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
        }
        a {
            color: #007AFF;
            text-decoration: none;
            font-weight: bold;
            background-color: #007AFF;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            display: inline-block;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
        }
        a:hover {
            background-color: #0056b3;
        }
        .url {
            background-color: #fafafa;
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 16px;
            font-family: monospace;
            word-break: break-all;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Restablecer Contraseña</h2>
        <p class="greeting">Hola {{ $user->name }},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <p style="text-align: center;"><a href="{{ $resetUrl }}" style="color: #FFF;">Restablecer Contraseña</a></p>
    </div>
</body>
</html>