import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { updateEspecialidad } from "../../apis/especialidadesApi";

const EspecialidadUpdateScreen = ({ route, navigation }) => {
  const { especialidad } = route.params;
  const [nombre, setNombre] = useState(especialidad.nombre);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!nombre) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const result = await updateEspecialidad(especialidad.id, { nombre });
      if (result.success) {
        Alert.alert('Éxito', 'Especialidad actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al actualizar la especialidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Especialidad</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default EspecialidadUpdateScreen;
