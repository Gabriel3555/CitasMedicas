import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// 🔹 Auth Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import LogoutScreen from "../screens/Auth/LogoutScreen";
import HomeScreen from "../screens/Auth/HomeScreen";

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

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        
        {/* 🔹 AUTH */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Registro" }} />
        <Stack.Screen name="Logout" component={LogoutScreen} options={{ title: "Logout" }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />

        {/* 🔹 EPS */}
        <Stack.Screen name="EPSList" component={EPSListScreen} options={{ title: "EPS" }} />
        <Stack.Screen name="EPSCreate" component={EPSCreateScreen} options={{ title: "Crear EPS" }} />
        <Stack.Screen name="EPSDetalle" component={EPSDetalleScreen} options={{ title: "Detalle EPS" }} />
        <Stack.Screen name="EPSDelete" component={EPSDeleteScreen} options={{ title: "Eliminar EPS" }} />
        <Stack.Screen name="EPSUpdate" component={EPSUpdateScreen} options={{ title: "Actualizar EPS" }} />

        {/* 🔹 Especialidades */}
        <Stack.Screen name="EspecialidadesList" component={EspecialidadesListScreen} options={{ title: "Especialidades" }} />
        <Stack.Screen name="EspecialidadCreate" component={EspecialidadCreateScreen} options={{ title: "Crear Especialidad" }} />
        <Stack.Screen name="EspecialidadDetalle" component={EspecialidadDetalleScreen} options={{ title: "Detalle Especialidad" }} />
        <Stack.Screen name="EspecialidadDelete" component={EspecialidadDeleteScreen} options={{ title: "Eliminar Especialidad" }} />
        <Stack.Screen name="EspecialidadUpdate" component={EspecialidadUpdateScreen} options={{ title: "Actualizar Especialidad" }} />

        {/* 🔹 Doctores */}
        <Stack.Screen name="DoctoresList" component={DoctoresListScreen} options={{ title: "Doctores" }} />
        <Stack.Screen name="DoctorCreate" component={DoctorCreateScreen} options={{ title: "Crear Doctor" }} />
        <Stack.Screen name="DoctorDetalle" component={DoctorDetalleScreen} options={{ title: "Detalle Doctor" }} />
        <Stack.Screen name="DoctorDelete" component={DoctorDeleteScreen} options={{ title: "Eliminar Doctor" }} />
        <Stack.Screen name="DoctorUpdate" component={DoctorUpdateScreen} options={{ title: "Actualizar Doctor" }} />

        {/* 🔹 Pacientes */}
        <Stack.Screen name="PacientesList" component={PacientesListScreen} options={{ title: "Pacientes" }} />
        <Stack.Screen name="PacienteCreate" component={PacienteCreateScreen} options={{ title: "Crear Paciente" }} />
        <Stack.Screen name="PacienteDetalle" component={PacienteDetalleScreen} options={{ title: "Detalle Paciente" }} />
        <Stack.Screen name="PacienteDelete" component={PacienteDeleteScreen} options={{ title: "Eliminar Paciente" }} />
        <Stack.Screen name="PacienteUpdate" component={PacienteUpdateScreen} options={{ title: "Actualizar Paciente" }} />

        {/* 🔹 Citas */}
        <Stack.Screen name="CitasList" component={CitasListScreen} options={{ title: "Citas" }} />
        <Stack.Screen name="CitaCreate" component={CitaCreateScreen} options={{ title: "Crear Cita" }} />
        <Stack.Screen name="CitaDetalle" component={CitaDetalleScreen} options={{ title: "Detalle Cita" }} />
        <Stack.Screen name="CitaDelete" component={CitaDeleteScreen} options={{ title: "Eliminar Cita" }} />
        <Stack.Screen name="CitaUpdate" component={CitaUpdateScreen} options={{ title: "Actualizar Cita" }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
