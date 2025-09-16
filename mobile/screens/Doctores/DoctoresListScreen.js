import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const DoctoresListScreen = ({ navigation }) => {
  const doctores = [
    { id: "1", nombre: "Dr. Juan Pérez", especialidad: "Cardiología" },
    { id: "2", nombre: "Dra. Ana Gómez", especialidad: "Pediatría" },
    { id: "3", nombre: "Dr. Luis Torres", especialidad: "Dermatología" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Doctores</Text>
      <FlatList
        data={doctores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("DoctorDetalle", { doctor: item })}
          >
            <Text style={styles.text}>{item.nombre} - {item.especialidad}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("DoctorCreate")}
      >
        <Text style={styles.buttonText}>➕ Crear Doctor</Text>
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

export default DoctoresListScreen;
