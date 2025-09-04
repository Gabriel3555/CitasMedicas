🏥 Sistema de Gestión de Citas Médicas - API REST

Una API RESTful desarrollada con Laravel para la gestión de citas médicas, pacientes, doctores, EPS y especialidades.

📋 Características

Autenticación JWT para acceso seguro a los endpoints
Gestión completa de pacientes, doctores, citas, EPS y especialidades
Relaciones complejas entre entidades
Validación de datos robusta
Documentación Swagger/OpenAPI integrada
Base de datos MySQL con migraciones y relaciones
🚀 Tecnologías Utilizadas

Laravel 12 - Framework PHP
MySQL - Base de datos
JWT Auth - Autenticación por tokens
Swagger/OpenAPI - Documentación de API
Tailwind CSS - Estilos (para futuras vistas)
Vite - Build tool para assets
📦 Instalación

Requisitos Previos

PHP 8.2+
Composer
MySQL
Node.js (opcional, para frontend)
Pasos de Instalación

Clonar el repositorio

bash
git clone <url-del-repositorio>
cd citas-medicas-api
Instalar dependencias de PHP

bash
composer install
Configurar variables de entorno

bash
cp .env.example .env
Editar el archivo .env con la configuración de tu base de datos:

env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=citasmedicas
DB_USERNAME=root
DB_PASSWORD=
Generar clave de aplicación

bash
php artisan key:generate
Generar clave JWT

bash
php artisan jwt:secret
Ejecutar migraciones

bash
php artisan migrate
Instalar dependencias de frontend (opcional)

bash
npm install
npm run dev
Iniciar servidor

bash
php artisan serve
🔐 Autenticación

La API utiliza autenticación JWT. Para acceder a los endpoints protegidos, incluye el token en el header:

http
Authorization: Bearer {token}
Endpoints de Autenticación

POST /login - Iniciar sesión
POST /register - Registrar nuevo usuario
POST /logout - Cerrar sesión (requiere token)
📚 Endpoints de la API

👥 Pacientes

GET /pacientes - Listar todos los pacientes
POST /pacientes - Crear nuevo paciente
GET /pacientes/{id} - Obtener paciente específico
PUT /pacientes/{id} - Actualizar paciente
DELETE /pacientes/{id} - Eliminar paciente
GET /pacientes/{id}/citas - Citas de un paciente
GET /pacientes/{id}/doctores - Doctores de un paciente
🩺 Doctores

GET /doctores - Listar todos los doctores
POST /doctores - Crear nuevo doctor
GET /doctores/{id} - Obtener doctor específico
PUT /doctores/{id} - Actualizar doctor
DELETE /doctores/{id} - Eliminar doctor
GET /doctores/{id}/citas - Citas de un doctor
GET /doctores/{id}/pacientes - Pacientes de un doctor
📅 Citas

GET /citas - Listar todas las citas
POST /citas - Crear nueva cita
GET /citas/{id} - Obtener cita específica
PUT /citas/{id} - Actualizar cita
DELETE /citas/{id} - Eliminar cita
GET /citas/{id}/detalle - Detalle completo de cita (con paciente y doctor)
🏢 EPS

GET /eps - Listar todas las EPS
POST /eps - Crear nueva EPS
GET /eps/{id} - Obtener EPS específica
PUT /eps/{id} - Actualizar EPS
DELETE /eps/{id} - Eliminar EPS
🎯 Especialidades

GET /especialidades - Listar todas las especialidades
POST /especialidades - Crear nueva especialidad
GET /especialidades/{id} - Obtener especialidad específica
PUT /especialidades/{id} - Actualizar especialidad
DELETE /especialidades/{id} - Eliminar especialidad
🗃️ Estructura de la Base de Datos

Tablas Principales

users - Usuarios del sistema
pacientes - Información de pacientes
doctores - Información de doctores
citas - Registro de citas médicas
eps - Entidades Promotoras de Salud
especialidades - Especialidades médicas
Relaciones

Un paciente pertenece a una EPS
Un doctor pertenece a una EPS y una especialidad
Una cita relaciona un paciente con un doctor
🧪 Testing

Ejecutar tests con:

bash
php artisan test
📊 Documentación API

La documentación Swagger está disponible en:

text
/api/documentation
Para generar la documentación:

bash
php artisan l5-swagger:generate
🛠️ Comandos Útiles

bash
# Ejecutar en modo desarrollo (servidor + queue + vite)
npm run dev

# Ejecutar tests
npm run test

# Limpiar cache de configuración
php artisan config:clear

# Ejecutar migraciones
php artisan migrate

# Ejecutar migraciones con datos de prueba
php artisan migrate --seed
📝 Estructura del Proyecto

text
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php      # Autenticación
│   │   ├── CitasController.php     # Gestión de citas
│   │   ├── DoctoresController.php  # Gestión de doctores
│   │   ├── PacientesController.php # Gestión de pacientes
│   │   ├── EPSController.php       # Gestión de EPS
│   │   └── EspecialidadesController.php # Gestión de especialidades
│   └── Models/
│       ├── citas.php
│       ├── doctores.php
│       ├── pacientes.php
│       ├── EPS.php
│       ├── especialidades.php
│       └── User.php
database/
├── migrations/     # Migraciones de base de datos
└── seeders/        # Datos de prueba
🤝 Contribución

Fork el proyecto
Crear una rama para tu feature (git checkout -b feature/AmazingFeature)
Commit tus cambios (git commit -m 'Add some AmazingFeature')
Push a la rama (git push origin feature/AmazingFeature)
Abrir un Pull Request
📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

🆘 Soporte

Si encuentras algún problema o tienes preguntas, por favor abre un issue en el repositorio.
