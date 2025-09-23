import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { createCita } from '../../apis/citasApi';
import { getPacientes } from '../../apis/pacientesApi';
import { getDoctores } from '../../apis/doctoresApi';

const CitaCreateScreen = ({ navigation }) => {
  const [pacientes_id, setPacientesId] = useState("");
  const [doctor_id, setDoctorId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const pacientesResult = await getPacientes();
      if (pacientesResult.success) {
        setPacientes(pacientesResult.data);
      }
      const doctoresResult = await getDoctores();
      if (doctoresResult.success) {
        setDoctores(doctoresResult.data);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!pacientes_id || !doctor_id || !fecha || !hora) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    const result = await createCita({ pacientes_id, doctor_id, fecha, hora });
    setLoading(false);
    if (result.success) {
      Alert.alert('Éxito', 'Cita creada exitosamente');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cita</Text>

      <Text style={styles.label}>Seleccionar Paciente:</Text>
      <Picker
        selectedValue={pacientes_id}
        onValueChange={(itemValue) => setPacientesId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona un paciente" value="" />
        {pacientes.map((paciente) => (
          <Picker.Item key={paciente.id} label={paciente.nombre} value={paciente.id.toString()} />
        ))}
      </Picker>

      <Text style={styles.label}>Seleccionar Doctor:</Text>
      <Picker
        selectedValue={doctor_id}
        onValueChange={(itemValue) => setDoctorId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona un doctor" value="" />
        {doctores.map((doctor) => (
          <Picker.Item key={doctor.id} label={doctor.nombre} value={doctor.id.toString()} />
        ))}
      </Picker>

      <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={fecha} onChangeText={setFecha} />
      <TextInput style={styles.input} placeholder="Hora (HH:MM)" value={hora} onChangeText={setHora} />

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Guardar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  picker: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#28a745", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default CitaCreateScreen;
