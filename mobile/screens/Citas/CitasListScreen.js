import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const CitasListScreen = ({ navigation }) => {
  const citas = [
    { id: "1", paciente: "Carlos Ruiz", doctor: "Dr. Juan Pérez", fecha: "2025-09-20", hora: "10:00", estado: "Pendiente" },
    { id: "2", paciente: "María López", doctor: "Dra. Ana Gómez", fecha: "2025-09-21", hora: "14:30", estado: "Confirmada" },
    { id: "3", paciente: "Pedro González", doctor: "Dr. Luis Torres", fecha: "2025-09-22", hora: "09:15", estado: "Cancelada" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Citas</Text>
      <FlatList
        data={citas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("CitaDetalle", { cita: item })}
          >
            <Text style={styles.text}>
              {item.fecha} {item.hora} - {item.paciente} con {item.doctor}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CitaCreate")}
      >
        <Text style={styles.buttonText}>➕ Crear Cita</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: "#ccc" },
  text: { fontSize: 16 },
  button: { marginTop: 20, backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default CitasListScreen;
