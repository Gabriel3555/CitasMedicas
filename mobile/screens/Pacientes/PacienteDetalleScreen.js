import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PacienteDetalleScreen = ({ route, navigation }) => {
  const { paciente } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle Paciente</Text>
      <Text style={styles.text}>ID: {paciente.id}</Text>
      <Text style={styles.text}>Nombre: {paciente.nombre}</Text>
      <Text style={styles.text}>Documento: {paciente.documento}</Text>
      <Text style={styles.text}>Email: {paciente.email || "N/A"}</Text>
      <Text style={styles.text}>Teléfono: {paciente.telefono || "N/A"}</Text>
      <Text style={styles.text}>EPS: {paciente.eps?.nombre || "N/A"}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("PacienteUpdate", { paciente })}
      >
        <Text style={styles.buttonText}>✏️ Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={() => navigation.navigate("PacienteDelete", { paciente })}
      >
        <Text style={styles.buttonText}>🗑 Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  text: { fontSize: 18, marginBottom: 10 },
  button: { marginTop: 10, backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default PacienteDetalleScreen;
