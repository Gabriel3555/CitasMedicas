# CitasMedicas

A Laravel-based REST API for managing medical appointments system.

## Description

This project provides a backend API for a medical appointments management system. It includes authentication, CRUD operations for patients, doctors, appointments, EPS (health insurance), and medical specialties.

## Features

- JWT-based user authentication
- Full CRUD operations for all entities
- Relationships between patients, doctors, and appointments
- EPS and specialty management
- Protected routes with middleware

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd backend2
   ```

2. Install dependencies:
   ```
   composer install
   ```

3. Configure environment:
   - Copy `.env.example` to `.env`
   - Set up your database configuration in `.env`

4. Run migrations:
   ```
   php artisan migrate
   ```

5. Start the server:
   ```
   php artisan serve --host=0.0.0.0 --port=8000
   ```

## API Documentation

The API endpoints are documented in Postman collection format. Import the `CitasMedicas_Postman_Collection.json` file into Postman to explore and test all available endpoints.

### Key Endpoints

- **Auth**: `/register`, `/login`, `/logout`, `/refresh`, `/me`
- **Pacientes**: CRUD operations and related appointments/doctors
- **Doctores**: CRUD operations and related appointments/patients
- **Citas**: Appointment management with full details
- **EPS**: Health insurance management
- **Especialidades**: Medical specialties management

## Technologies Used

- Laravel 11
- JWT Authentication (tymon/jwt-auth)
- MySQL/PostgreSQL
- Composer

## Database Schema

The system includes the following main entities:
- Users (for authentication)
- Pacientes (Patients)
- Doctores (Doctors)
- Citas (Appointments)
- EPS (Health Insurance)
- Especialidades (Specialties)

## Usage

1. Register a new user or login with existing credentials
2. Use the JWT token in Authorization header for protected routes
3. Create EPS and Especialidades first if needed
4. Manage patients and doctors
5. Schedule appointments between patients and doctors

## Contributing

Feel free to submit issues and pull requests.

## License

This project is open-sourced software licensed under the MIT license.
