import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const EspecialidadDetalleScreen = ({ route, navigation }) => {
  const { especialidad } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle Especialidad</Text>
      <Text style={styles.text}>ID: {especialidad.id}</Text>
      <Text style={styles.text}>Nombre: {especialidad.nombre}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EspecialidadUpdate", { especialidad })}
      >
        <Text style={styles.buttonText}>✏️ Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={() => navigation.navigate("EspecialidadDelete", { especialidad })}
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

export default EspecialidadDetalleScreen;
