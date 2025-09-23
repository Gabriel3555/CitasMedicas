import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createEps } from '../../apis/epsApi';

const EPSCreateScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!nombre) {
      Alert.alert('Error', 'Por favor ingresa el nombre de la EPS');
      return;
    }
    setLoading(true);
    const result = await createEps({ nombre });
    setLoading(false);
    if (result.success) {
      Alert.alert('Éxito', 'EPS creada exitosamente');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear EPS</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre EPS"
        value={nombre}
        onChangeText={setNombre}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Guardar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#28a745", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default EPSCreateScreen;
