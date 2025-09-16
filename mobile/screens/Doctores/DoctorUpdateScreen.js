import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const DoctorUpdateScreen = ({ route, navigation }) => {
  const { doctor } = route.params;
  const [nombre, setNombre] = useState(doctor.nombre);
  const [especialidad, setEspecialidad] = useState(doctor.especialidad);
  const [email, setEmail] = useState(doctor.email || "");
  const [telefono, setTelefono] = useState(doctor.telefono || "");

  const handleUpdate = () => {
    alert(`Doctor actualizado: ${nombre} (solo UI)`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Doctor</Text>

      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} value={especialidad} onChangeText={setEspecialidad} />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />

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

export default DoctorUpdateScreen;
