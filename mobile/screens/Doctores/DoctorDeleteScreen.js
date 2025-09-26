import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { deleteDoctor } from "../../apis/doctoresApi";

const DoctorDeleteScreen = ({ route, navigation }) => {
  const { doctor } = route.params;
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteDoctor(doctor.id);
      if (result.success) {
        Alert.alert('Éxito', 'Doctor eliminado correctamente', [
          { text: 'OK', onPress: () => navigation.popToTop() }
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado al eliminar el doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eliminar Doctor</Text>
      <Text style={styles.text}>¿Seguro que deseas eliminar "{doctor.nombre}"?</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "red" }]}
        onPress={handleDelete}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ccc" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.buttonText, { color: "black" }]}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  text: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  button: { marginTop: 10, padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default DoctorDeleteScreen;
