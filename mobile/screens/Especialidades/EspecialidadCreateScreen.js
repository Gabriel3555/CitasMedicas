import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { createEspecialidad } from "../../apis/especialidadesApi";

const EspecialidadCreateScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!nombre) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const result = await createEspecialidad({ nombre });
      if (result.success) {
        Alert.alert('Éxito', 'Especialidad creada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al crear la especialidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Especialidad</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre Especialidad"
        value={nombre}
        onChangeText={setNombre}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creando...' : 'Guardar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#28a745", padding: 15, borderRadius: 8 },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default EspecialidadCreateScreen;
