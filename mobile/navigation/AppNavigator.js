import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// 🔹 Auth Screens
import SplashScreen from "../screens/Auth/SplashScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import LogoutScreen from "../screens/Auth/LogoutScreen";
import HomeScreen from "../screens/Auth/HomeScreen";

// 🔹 Dashboard Screens
import PatientDashboard from "../screens/Dashboard/PatientDashboard";
import DoctorDashboard from "../screens/Dashboard/DoctorDashboard";
import AdminDashboard from "../screens/Dashboard/AdminDashboard";

// 🔹 Appointment Screens
import ScheduleAppointmentScreen from "../screens/Appointments/ScheduleAppointmentScreen";
import DoctorAppointmentsScreen from "../screens/Appointments/DoctorAppointmentsScreen";
import PatientAppointmentsScreen from "../screens/Appointments/PatientAppointmentsScreen";

// 🔹 EPS Screens
import EPSListScreen from "../screens/EPS/EPSListScreen";
import EPSCreateScreen from "../screens/EPS/EPSCreateScreen";
import EPSDetalleScreen from "../screens/EPS/EPSDetalleScreen";
import EPSDeleteScreen from "../screens/EPS/EPSDeleteScreen";
import EPSUpdateScreen from "../screens/EPS/EPSUpdateScreen";

// 🔹 Especialidades Screens
import EspecialidadesListScreen from "../screens/Especialidades/EspecialidadesListScreen";
import EspecialidadCreateScreen from "../screens/Especialidades/EspecialidadCreateScreen";
import EspecialidadDetalleScreen from "../screens/Especialidades/EspecialidadDetalleScreen";
import EspecialidadDeleteScreen from "../screens/Especialidades/EspecialidadDeleteScreen";
import EspecialidadUpdateScreen from "../screens/Especialidades/EspecialidadUpdateScreen";

// 🔹 Doctores Screens
import DoctoresListScreen from "../screens/Doctores/DoctoresListScreen";
import DoctorCreateScreen from "../screens/Doctores/DoctorCreateScreen";
import DoctorDetalleScreen from "../screens/Doctores/DoctorDetalleScreen";
import DoctorDeleteScreen from "../screens/Doctores/DoctorDeleteScreen";
import DoctorUpdateScreen from "../screens/Doctores/DoctorUpdateScreen";

// 🔹 Pacientes Screens
import PacientesListScreen from "../screens/Pacientes/PacientesListScreen";
import PacienteCreateScreen from "../screens/Pacientes/PacienteCreateScreen";
import PacienteDetalleScreen from "../screens/Pacientes/PacienteDetalleScreen";
import PacienteDeleteScreen from "../screens/Pacientes/PacienteDeleteScreen";
import PacienteUpdateScreen from "../screens/Pacientes/PacienteUpdateScreen";

// 🔹 Citas Screens
import CitasListScreen from "../screens/Citas/CitasListScreen";
import CitaCreateScreen from "../screens/Citas/CitaCreateScreen";
import CitaDetalleScreen from "../screens/Citas/CitaDetalleScreen";
import CitaDeleteScreen from "../screens/Citas/CitaDeleteScreen";
import CitaUpdateScreen from "../screens/Citas/CitaUpdateScreen";

// 🔹 Profile Screen
import ProfileScreen from "../screens/Profile/ProfileScreen";

// 🔹 Admin Screens
import AdminPacientesListScreen from "../screens/Admin/AdminPacientesListScreen";
import AdminPacienteCreateScreen from "../screens/Admin/AdminPacienteCreateScreen";
import AdminPacienteUpdateScreen from "../screens/Admin/AdminPacienteUpdateScreen";
import AdminDoctoresListScreen from "../screens/Admin/AdminDoctoresListScreen";
import AdminDoctorCreateScreen from "../screens/Admin/AdminDoctorCreateScreen";
import AdminDoctorUpdateScreen from "../screens/Admin/AdminDoctorUpdateScreen";
import AdminAdminsListScreen from "../screens/Admin/AdminAdminsListScreen";
import AdminAdminCreateScreen from "../screens/Admin/AdminAdminCreateScreen";
import AdminAdminUpdateScreen from "../screens/Admin/AdminAdminUpdateScreen";
import AdminEPSListScreen from "../screens/Admin/AdminEPSListScreen";
import AdminEPSCreateScreen from "../screens/Admin/AdminEPSCreateScreen";
import AdminEPSUpdateScreen from "../screens/Admin/AdminEPSUpdateScreen";
import AdminEspecialidadesListScreen from "../screens/Admin/AdminEspecialidadesListScreen";
import AdminEspecialidadCreateScreen from "../screens/Admin/AdminEspecialidadCreateScreen";
import AdminEspecialidadUpdateScreen from "../screens/Admin/AdminEspecialidadUpdateScreen";
import AdminCitasListScreen from "../screens/Admin/AdminCitasListScreen";
import AdminCitaCreateScreen from "../screens/Admin/AdminCitaCreateScreen";
import AdminCitaUpdateScreen from "../screens/Admin/AdminCitaUpdateScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="EPS" component={EPSListScreen} />
      <Tab.Screen name="Especialidades" component={EspecialidadesListScreen} />
      <Tab.Screen name="Doctores" component={DoctoresListScreen} />
      <Tab.Screen name="Pacientes" component={PacientesListScreen} />
      <Tab.Screen name="Citas" component={CitasListScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        
        {/* 🔹 AUTH */}
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Registro" }} />
        <Stack.Screen name="Logout" component={LogoutScreen} options={{ title: "Logout" }} />

        {/* 🔹 PROFILE */}
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Mi Perfil" }} />

        {/* 🔹 DASHBOARDS */}
        <Stack.Screen name="PatientDashboard" component={PatientDashboard} options={{ title: "Paciente" }} />
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} options={{ title: "Doctor" }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "Admin" }} />

        {/* 🔹 APPOINTMENTS */}
        <Stack.Screen name="ScheduleAppointment" component={ScheduleAppointmentScreen} options={{ title: "Agendar Cita" }} />
        <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} options={{ title: "Mis Citas" }} />
        <Stack.Screen name="PatientAppointments" component={PatientAppointmentsScreen} options={{ title: "Mis Citas" }} />

        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />

        {/* 🔹 EPS */}
        <Stack.Screen name="EPSCreate" component={EPSCreateScreen} options={{ title: "Crear EPS" }} />
        <Stack.Screen name="EPSDetalle" component={EPSDetalleScreen} options={{ title: "Detalle EPS" }} />
        <Stack.Screen name="EPSDelete" component={EPSDeleteScreen} options={{ title: "Eliminar EPS" }} />
        <Stack.Screen name="EPSUpdate" component={EPSUpdateScreen} options={{ title: "Actualizar EPS" }} />

        {/* 🔹 Especialidades */}
        <Stack.Screen name="EspecialidadCreate" component={EspecialidadCreateScreen} options={{ title: "Crear Especialidad" }} />
        <Stack.Screen name="EspecialidadDetalle" component={EspecialidadDetalleScreen} options={{ title: "Detalle Especialidad" }} />
        <Stack.Screen name="EspecialidadDelete" component={EspecialidadDeleteScreen} options={{ title: "Eliminar Especialidad" }} />
        <Stack.Screen name="EspecialidadUpdate" component={EspecialidadUpdateScreen} options={{ title: "Actualizar Especialidad" }} />

        {/* 🔹 Doctores */}
        <Stack.Screen name="DoctorCreate" component={DoctorCreateScreen} options={{ title: "Crear Doctor" }} />
        <Stack.Screen name="DoctorDetalle" component={DoctorDetalleScreen} options={{ title: "Detalle Doctor" }} />
        <Stack.Screen name="DoctorDelete" component={DoctorDeleteScreen} options={{ title: "Eliminar Doctor" }} />
        <Stack.Screen name="DoctorUpdate" component={DoctorUpdateScreen} options={{ title: "Actualizar Doctor" }} />

        {/* 🔹 Pacientes */}
        <Stack.Screen name="PacienteCreate" component={PacienteCreateScreen} options={{ title: "Crear Paciente" }} />
        <Stack.Screen name="PacienteDetalle" component={PacienteDetalleScreen} options={{ title: "Detalle Paciente" }} />
        <Stack.Screen name="PacienteDelete" component={PacienteDeleteScreen} options={{ title: "Eliminar Paciente" }} />
        <Stack.Screen name="PacienteUpdate" component={PacienteUpdateScreen} options={{ title: "Actualizar Paciente" }} />

        {/* 🔹 Citas */}
        <Stack.Screen name="CitaCreate" component={CitaCreateScreen} options={{ title: "Crear Cita" }} />
        <Stack.Screen name="CitaDetalle" component={CitaDetalleScreen} options={{ title: "Detalle Cita" }} />
        <Stack.Screen name="CitaDelete" component={CitaDeleteScreen} options={{ title: "Eliminar Cita" }} />
        <Stack.Screen name="CitaUpdate" component={CitaUpdateScreen} options={{ title: "Actualizar Cita" }} />

        {/* 🔹 Admin - Pacientes */}
        <Stack.Screen name="AdminPacientesList" component={AdminPacientesListScreen} options={{ title: "Gestionar Pacientes" }} />
        <Stack.Screen name="AdminPacienteCreate" component={AdminPacienteCreateScreen} options={{ title: "Crear Paciente" }} />
        <Stack.Screen name="AdminPacienteUpdate" component={AdminPacienteUpdateScreen} options={{ title: "Actualizar Paciente" }} />

        {/* 🔹 Admin - Doctores */}
        <Stack.Screen name="AdminDoctoresList" component={AdminDoctoresListScreen} options={{ title: "Gestionar Doctores" }} />
        <Stack.Screen name="AdminDoctorCreate" component={AdminDoctorCreateScreen} options={{ title: "Crear Doctor" }} />
        <Stack.Screen name="AdminDoctorUpdate" component={AdminDoctorUpdateScreen} options={{ title: "Actualizar Doctor" }} />

        {/* 🔹 Admin - Administradores */}
        <Stack.Screen name="AdminAdminsList" component={AdminAdminsListScreen} options={{ title: "Gestionar Administradores" }} />
        <Stack.Screen name="AdminAdminCreate" component={AdminAdminCreateScreen} options={{ title: "Crear Administrador" }} />
        <Stack.Screen name="AdminAdminUpdate" component={AdminAdminUpdateScreen} options={{ title: "Actualizar Administrador" }} />

        {/* 🔹 Admin - EPS */}
        <Stack.Screen name="AdminEPSList" component={AdminEPSListScreen} options={{ title: "Gestionar EPS" }} />
        <Stack.Screen name="AdminEPSCreate" component={AdminEPSCreateScreen} options={{ title: "Crear EPS" }} />
        <Stack.Screen name="AdminEPSUpdate" component={AdminEPSUpdateScreen} options={{ title: "Actualizar EPS" }} />

        {/* 🔹 Admin - Especialidades */}
        <Stack.Screen name="AdminEspecialidadesList" component={AdminEspecialidadesListScreen} options={{ title: "Gestionar Especialidades" }} />
        <Stack.Screen name="AdminEspecialidadCreate" component={AdminEspecialidadCreateScreen} options={{ title: "Crear Especialidad" }} />
        <Stack.Screen name="AdminEspecialidadUpdate" component={AdminEspecialidadUpdateScreen} options={{ title: "Actualizar Especialidad" }} />

        {/* 🔹 Admin - Citas */}
        <Stack.Screen name="AdminCitasList" component={AdminCitasListScreen} options={{ title: "Gestionar Citas" }} />
        <Stack.Screen name="AdminCitaCreate" component={AdminCitaCreateScreen} options={{ title: "Crear Cita" }} />
        <Stack.Screen name="AdminCitaUpdate" component={AdminCitaUpdateScreen} options={{ title: "Actualizar Cita" }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
