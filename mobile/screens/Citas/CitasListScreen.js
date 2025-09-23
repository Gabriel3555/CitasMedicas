import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getCitas } from '../../apis/citasApi';

const CitasListScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    const result = await getCitas();
    setLoading(false);
    if (result.success) {
      setCitas(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Citas</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => item.id.toString()}
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
      )}
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
