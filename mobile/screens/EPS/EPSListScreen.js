import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getEps } from '../../apis/epsApi';

const EPSListScreen = ({ navigation }) => {
  const [epsData, setEpsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEps();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEps();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchEps = async () => {
    const result = await getEps();
    setLoading(false);
    if (result.success) {
      setEpsData(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listado de EPS</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={epsData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate("EPSDetalle", { eps: item })}
            >
              <Text style={styles.text}>{item.nombre}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
