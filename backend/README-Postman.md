# 🏥 Citas Médicas API - Postman Workspace

Este workspace contiene todo lo necesario para probar la **API de Gestión de Citas Médicas** en Postman.

## 📂 Archivos Incluidos

- `citas-medicas.postman_collection.json` → Colección con todos los endpoints CRUD y relaciones documentados.
- `citas-medicas.postman_environment.json` → Environment con variables `base_url` y `token`.

## 🚀 Pasos para Usar en Postman

1. Abrir Postman.
2. Importar el archivo de **environment**:
   - `citas-medicas.postman_environment.json`
   - Esto cargará las variables:
     - `base_url` → URL base de tu API (por defecto: `http://127.0.0.1:8000/api`)
     - `token` → se llenará luego de hacer login.
3. Importar la **colección**:
   - `citas-medicas.postman_collection.json`
   - Incluye endpoints organizados en carpetas:
     - **Auth** 🔑 → login, register, logout
     - **Pacientes** 👥 → CRUD + citas + doctores
     - **Doctores** 🩺 → CRUD + citas + pacientes
     - **Citas** 📅 → CRUD + detalle completo
     - **EPS** 🏢 → CRUD
     - **Especialidades** 🎯 → CRUD
4. Seleccionar el **environment "Citas Médicas Local"** en Postman.
5. Ejecutar el request **Auth → Login** con un usuario válido.
6. Copiar el `access_token` devuelto y pegarlo en la variable `token` del environment.
7. Probar los demás endpoints (ya usan `{{token}}` automáticamente en el header Authorization).

## ✅ Recomendación

- Crear un usuario con `register` antes de probar el login.
- Usar `php artisan serve` para levantar el backend en `http://127.0.0.1:8000`.

Con esto ya puedes hacer pruebas completas de la API desde Postman 🎉
