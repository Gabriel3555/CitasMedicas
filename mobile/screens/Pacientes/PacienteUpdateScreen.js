import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const PacienteUpdateScreen = ({ route, navigation }) => {
  const { paciente } = route.params;
  const [nombre, setNombre] = useState(paciente.nombre);
  const [documento, setDocumento] = useState(paciente.documento);
  const [email, setEmail] = useState(paciente.email || "");
  const [telefono, setTelefono] = useState(paciente.telefono || "");

  const handleUpdate = () => {
    alert(`Paciente actualizado: ${nombre} (solo UI)`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Paciente</Text>

      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} value={documento} onChangeText={setDocumento} />
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

export default PacienteUpdateScreen;
