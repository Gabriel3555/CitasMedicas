import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const CitaUpdateScreen = ({ route, navigation }) => {
  const { cita } = route.params;
  const [paciente, setPaciente] = useState(cita.paciente);
  const [doctor, setDoctor] = useState(cita.doctor);
  const [fecha, setFecha] = useState(cita.fecha);
  const [hora, setHora] = useState(cita.hora);
  const [estado, setEstado] = useState(cita.estado);

  const handleUpdate = () => {
    alert(`Cita actualizada: ${paciente} con ${doctor} (solo UI)`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Cita</Text>

      <TextInput style={styles.input} value={paciente} onChangeText={setPaciente} />
      <TextInput style={styles.input} value={doctor} onChangeText={setDoctor} />
      <TextInput style={styles.input} value={fecha} onChangeText={setFecha} />
      <TextInput style={styles.input} value={hora} onChangeText={setHora} />
      <TextInput style={styles.input} value={estado} onChangeText={setEstado} />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default CitaUpdateScreen;
