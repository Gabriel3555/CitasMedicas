import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { updateEps } from '../../apis/epsApi';

const EPSUpdateScreen = ({ route, navigation }) => {
  const { eps } = route.params;
  const [nombre, setNombre] = useState(eps.nombre);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!nombre) {
      Alert.alert('Error', 'Por favor ingresa el nombre de la EPS');
      return;
    }
    setLoading(true);
    const result = await updateEps(eps.id, { nombre });
    setLoading(false);
    if (result.success) {
      Alert.alert('Éxito', 'EPS actualizada exitosamente');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar EPS</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Actualizando...' : 'Guardar Cambios'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default EPSUpdateScreen;
