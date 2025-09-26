import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { updateDoctor } from "../../apis/doctoresApi";

const DoctorUpdateScreen = ({ route, navigation }) => {
  const { doctor } = route.params;
  const [nombre, setNombre] = useState(doctor.nombre);
  const [especialidad, setEspecialidad] = useState(doctor.especialidad);
  const [email, setEmail] = useState(doctor.email || "");
  const [telefono, setTelefono] = useState(doctor.telefono || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!nombre || !email || !telefono || !especialidad) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const result = await updateDoctor(doctor.id, {
        nombre,
        email,
        telefono,
        especialidad_id: especialidad
      });
      if (result.success) {
        Alert.alert('Éxito', 'Doctor actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al actualizar el doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Doctor</Text>

      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} value={especialidad} onChangeText={setEspecialidad} />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />

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

export default DoctorUpdateScreen;
