import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const EPSDetalleScreen = ({ route, navigation }) => {
  const { eps } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle EPS</Text>
      <Text style={styles.text}>ID: {eps.id}</Text>
      <Text style={styles.text}>Nombre: {eps.nombre}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EPSUpdate", { eps })}
      >
        <Text style={styles.buttonText}>✏️ Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={() => navigation.navigate("EPSDelete", { eps })}
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

export default EPSDetalleScreen;
