import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getPacientes } from '../../apis/pacientesApi';

const PacientesListScreen = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPacientes();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPacientes();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPacientes = async () => {
    const result = await getPacientes();
    setLoading(false);
    if (result.success) {
      setPacientes(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Pacientes</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate("PacienteDetalle", { paciente: item })}
            >
              <Text style={styles.text}>{item.nombre} - {item.documento}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
