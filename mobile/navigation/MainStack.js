import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import CitasListScreen from "../screens/Citas/CitasListScreen";
import CitaDetailScreen from "../screens/Citas/CitaDetailScreen";
import CrearCitaScreen from "../screens/Citas/CrearCitaScreen";
import DoctoresListScreen from "../screens/Doctores/DoctoresListScreen";
import DoctorDetailScreen from "../screens/Doctores/DoctorDetailScreen";
import CrearDoctorScreen from "../screens/Doctores/CrearDoctorScreen";
import PacientesListScreen from "../screens/Pacientes/PacientesListScreen";
import PacienteDetailScreen from "../screens/Pacientes/PacienteDetailScreen";
import CrearPacienteScreen from "../screens/Pacientes/CrearPacienteScreen";
import EditarPacienteScreen from "../screens/Pacientes/EditarPacienteScreen";
import EPSListScreen from "../screens/EPS/EPSListScreen";
import CrearEPSScreen from "../screens/EPS/CrearEPSScreen";
import EspecialidadesListScreen from "../screens/Especialidades/EspecialidadesListScreen";
import CrearEspecialidadScreen from "../screens/Especialidades/CrearEspecialidadScreen";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Inicio" }}
      />
      <Stack.Screen name="Citas" component={CitasListScreen} />
      <Stack.Screen name="CitaDetail" component={CitaDetailScreen} />
      <Stack.Screen name="CrearCita" component={CrearCitaScreen} />
      <Stack.Screen name="Doctores" component={DoctoresListScreen} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <Stack.Screen name="CrearDoctor" component={CrearDoctorScreen} />
      <Stack.Screen name="Pacientes" component={PacientesListScreen} />
      <Stack.Screen name="PacienteDetail" component={PacienteDetailScreen} />
      <Stack.Screen name="CrearPaciente" component={CrearPacienteScreen} />
      <Stack.Screen name="EditarPaciente" component={EditarPacienteScreen} />
      <Stack.Screen name="EPS" component={EPSListScreen} />
      <Stack.Screen name="CrearEPS" component={CrearEPSScreen} />
      <Stack.Screen name="Especialidades" component={EspecialidadesListScreen} />
      <Stack.Screen
        name="CrearEspecialidad"
        component={CrearEspecialidadScreen}
      />
    </Stack.Navigator>
  );
}
