import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const EPSDeleteScreen = ({ route, navigation }) => {
  const { eps } = route.params;

  const handleDelete = () => {
    alert(`EPS "${eps.nombre}" eliminada (solo UI)`);
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eliminar EPS</Text>
      <Text style={styles.text}>¿Seguro que deseas eliminar "{eps.nombre}"?</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={handleDelete}
      >
        <Text style={styles.buttonText}>Eliminar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ccc" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.buttonText, { color: "black" }]}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  text: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  button: { marginTop: 10, padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default EPSDeleteScreen;
