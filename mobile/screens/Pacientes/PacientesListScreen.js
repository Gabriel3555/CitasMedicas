import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const PacientesListScreen = ({ navigation }) => {
  const pacientes = [
    { id: "1", nombre: "Carlos Ruiz", documento: "12345678" },
    { id: "2", nombre: "María López", documento: "87654321" },
    { id: "3", nombre: "Pedro González", documento: "11223344" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Pacientes</Text>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("PacienteDetalle", { paciente: item })}
          >
            <Text style={styles.text}>{item.nombre} - {item.documento}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("PacienteCreate")}
      >
        <Text style={styles.buttonText}>➕ Crear Paciente</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: "#ccc" },
  text: { fontSize: 18 },
  button: { marginTop: 20, backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default PacientesListScreen;
