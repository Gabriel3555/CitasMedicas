import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getDoctores } from '../../apis/doctoresApi';

const DoctoresListScreen = ({ navigation }) => {
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctores();
  }, []);

  const fetchDoctores = async () => {
    const result = await getDoctores();
    setLoading(false);
    if (result.success) {
      setDoctores(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Doctores</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={doctores}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate("DoctorDetalle", { doctor: item })}
            >
              <Text style={styles.text}>{item.nombre} - {item.especialidad}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
