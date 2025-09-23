import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getEspecialidades } from '../../apis/especialidadesApi';

const EspecialidadesListScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    const result = await getEspecialidades();
    setLoading(false);
    if (result.success) {
      setData(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de Especialidades</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate("EspecialidadDetalle", { especialidad: item })}
            >
              <Text style={styles.text}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EspecialidadCreate")}
      >
        <Text style={styles.buttonText}>➕ Crear Especialidad</Text>
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

export default EspecialidadesListScreen;
