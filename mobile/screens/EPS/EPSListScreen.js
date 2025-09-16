import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const EPSListScreen = ({ navigation }) => {
  const epsData = [
    { id: "1", nombre: "Sanitas" },
    { id: "2", nombre: "Sura" },
    { id: "3", nombre: "Nueva EPS" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de EPS</Text>
      <FlatList
        data={epsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("EPSDetalle", { eps: item })}
          >
            <Text style={styles.text}>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EPSCreate")}
      >
        <Text style={styles.buttonText}>➕ Crear EPS</Text>
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

export default EPSListScreen;
