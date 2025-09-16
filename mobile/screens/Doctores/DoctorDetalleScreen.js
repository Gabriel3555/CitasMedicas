import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DoctorDetalleScreen = ({ route, navigation }) => {
  const { doctor } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle Doctor</Text>
      <Text style={styles.text}>ID: {doctor.id}</Text>
      <Text style={styles.text}>Nombre: {doctor.nombre}</Text>
      <Text style={styles.text}>Especialidad: {doctor.especialidad}</Text>
      <Text style={styles.text}>Email: {doctor.email || "N/A"}</Text>
      <Text style={styles.text}>Teléfono: {doctor.telefono || "N/A"}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("DoctorUpdate", { doctor })}
      >
        <Text style={styles.buttonText}>✏️ Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={() => navigation.navigate("DoctorDelete", { doctor })}
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

export default DoctorDetalleScreen;
