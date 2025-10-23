import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SplashScreen from "../screens/Auth/SplashScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import LogoutScreen from "../screens/Auth/LogoutScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";

import AdminDashboard from "../screens/Dashboard/AdminDashboard";
import PacienteDashboard from "../screens/Dashboard/PacienteDashboard";
import DoctorDashboard from "../screens/Dashboard/DoctorDashboard";

import AdminCitasListScreen from "../screens/Admin/AdminCitasListScreen";
import AdminCitaCreateScreen from "../screens/Admin/AdminCitaCreateScreen";
import AdminCitaUpdateScreen from "../screens/Admin/AdminCitaUpdateScreen";

import AdminEPSListScreen from "../screens/Admin/AdminEPSListScreen";
import AdminEPSCreateScreen from "../screens/Admin/AdminEPSCreateScreen";
import AdminEPSUpdateScreen from "../screens/Admin/AdminEPSUpdateScreen";

import AdminEspecialidadesListScreen from "../screens/Admin/AdminEspecialidadesListScreen";
import AdminEspecialidadCreateScreen from "../screens/Admin/AdminEspecialidadCreateScreen";
import AdminEspecialidadUpdateScreen from "../screens/Admin/AdminEspecialidadUpdateScreen";

import AdminDoctoresListScreen from "../screens/Admin/AdminDoctoresListScreen";
import AdminDoctorCreateScreen from "../screens/Admin/AdminDoctorCreateScreen";
import AdminDoctorUpdateScreen from "../screens/Admin/AdminDoctorUpdateScreen";
import AdminDoctorScheduleScreen from "../screens/Admin/AdminDoctorScheduleScreen";

import AdminPacientesListScreen from "../screens/Admin/AdminPacientesListScreen";
import AdminPacienteCreateScreen from "../screens/Admin/AdminPacienteCreateScreen";
import AdminPacienteUpdateScreen from "../screens/Admin/AdminPacienteUpdateScreen";

import ProfileScreen from "../screens/Profile/ProfileScreen";

import ScheduleAppointmentScreen from "../screens/Appointments/ScheduleAppointmentScreen";
import DoctorAppointmentsScreen from "../screens/Appointments/DoctorAppointmentsScreen";
import DoctorScheduleAppointmentScreen from "../screens/Appointments/DoctorScheduleAppointmentScreen";
import CitasListScreen from "../screens/Citas/CitasListScreen";
import CitaDetalleScreen from "../screens/Citas/CitaDetalleScreen";
import CitaCreateScreen from "../screens/Citas/CitaCreateScreen";
import CitaUpdateScreen from "../screens/Citas/CitaUpdateScreen";
import CitaDeleteScreen from "../screens/Citas/CitaDeleteScreen";

import DoctorScheduleManagementScreen from "../screens/Doctor/DoctorScheduleManagementScreen";

import AdminAdminsListScreen from "../screens/Admin/AdminAdminsListScreen";
import AdminAdminCreateScreen from "../screens/Admin/AdminAdminCreateScreen";
import AdminAdminUpdateScreen from "../screens/Admin/AdminAdminUpdateScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación por pestañas para administradores
const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="EPS" component={AdminEPSListScreen} />
      <Tab.Screen name="Especialidades" component={AdminEspecialidadesListScreen} />
      <Tab.Screen name="Doctores" component={AdminDoctoresListScreen} />
      <Tab.Screen name="Pacientes" component={AdminPacientesListScreen} />
      <Tab.Screen name="Citas" component={AdminCitasListScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator =  () => {
  // Check for deep link data and determine initial route
  const getInitialRoute = () => {
    if (global.deepLinkData && global.deepLinkData.screen === 'ResetPassword') {
      return 'ResetPassword';
    }
    return 'Splash';
  };

  // Configuración principal de navegación de la aplicación
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={getInitialRoute()}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Registro" }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Recuperar Contraseña" }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Nueva Contraseña" }}
          initialParams={global.deepLinkData && global.deepLinkData.screen === 'ResetPassword' ? global.deepLinkData.params : undefined}
        />
        <Stack.Screen name="Logout" component={LogoutScreen} options={{ title: "Logout" }} />

        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Mi Perfil" }} />

        <Stack.Screen name="ScheduleAppointment" component={ScheduleAppointmentScreen} options={{ title: "Agendar Cita" }} />
        <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} options={{ title: "Mis Citas" }} />
        <Stack.Screen name="DoctorScheduleAppointment" component={DoctorScheduleAppointmentScreen} options={{ title: "Agendar Cita para Paciente" }} />
        <Stack.Screen name="DoctorScheduleManagement" component={DoctorScheduleManagementScreen} options={{ title: "Gestionar Horario" }} />
        <Stack.Screen name="CitasList" component={CitasListScreen} options={{ title: "Mis Citas" }} />
        <Stack.Screen name="CitaDetalle" component={CitaDetalleScreen} options={{ title: "Detalle de Cita" }} />
        <Stack.Screen name="CitaCreate" component={CitaCreateScreen} options={{ title: "Crear Cita" }} />
        <Stack.Screen name="CitaUpdate" component={CitaUpdateScreen} options={{ title: "Actualizar Cita" }} />
        <Stack.Screen name="CitaDelete" component={CitaDeleteScreen} options={{ title: "Eliminar Cita" }} />

        <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: "Admin" }} />
        <Stack.Screen name="PacienteDashboard" component={PacienteDashboard} options={{ title: "Paciente" }} />
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} options={{ title: "Doctor" }} />

        <Stack.Screen name="AdminCitasList" component={AdminCitasListScreen} options={{ title: "Gestionar Citas" }} />
        <Stack.Screen name="AdminCitaCreate" component={AdminCitaCreateScreen} options={{ title: "Crear Cita" }} />
        <Stack.Screen name="AdminCitaUpdate" component={AdminCitaUpdateScreen} options={{ title: "Actualizar Cita" }} />

        <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />

        <Stack.Screen name="AdminEPSList" component={AdminEPSListScreen} options={{ title: "Gestionar EPS" }} />
        <Stack.Screen name="AdminEPSCreate" component={AdminEPSCreateScreen} options={{ title: "Crear EPS" }} />
        <Stack.Screen name="AdminEPSUpdate" component={AdminEPSUpdateScreen} options={{ title: "Actualizar EPS" }} />

        <Stack.Screen name="AdminEspecialidadesList" component={AdminEspecialidadesListScreen} options={{ title: "Gestionar Especialidades" }} />
        <Stack.Screen name="AdminEspecialidadCreate" component={AdminEspecialidadCreateScreen} options={{ title: "Crear Especialidad" }} />
        <Stack.Screen name="AdminEspecialidadUpdate" component={AdminEspecialidadUpdateScreen} options={{ title: "Actualizar Especialidad" }} />

        <Stack.Screen name="AdminDoctoresList" component={AdminDoctoresListScreen} options={{ title: "Gestionar Doctores" }} />
        <Stack.Screen name="AdminDoctorCreate" component={AdminDoctorCreateScreen} options={{ title: "Crear Doctor" }} />
        <Stack.Screen name="AdminDoctorUpdate" component={AdminDoctorUpdateScreen} options={{ title: "Actualizar Doctor" }} />
        <Stack.Screen name="AdminDoctorSchedule" component={AdminDoctorScheduleScreen} options={{ title: "Configurar Horario" }} />

        <Stack.Screen name="AdminPacientesList" component={AdminPacientesListScreen} options={{ title: "Gestionar Pacientes" }} />
        <Stack.Screen name="AdminPacienteCreate" component={AdminPacienteCreateScreen} options={{ title: "Crear Paciente" }} />
        <Stack.Screen name="AdminPacienteUpdate" component={AdminPacienteUpdateScreen} options={{ title: "Actualizar Paciente" }} />

        <Stack.Screen name="AdminAdminsList" component={AdminAdminsListScreen} options={{ title: "Gestionar Administradores" }} />
        <Stack.Screen name="AdminAdminCreate" component={AdminAdminCreateScreen} options={{ title: "Crear Administrador" }} />
        <Stack.Screen name="AdminAdminUpdate" component={AdminAdminUpdateScreen} options={{ title: "Actualizar Administrador" }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
