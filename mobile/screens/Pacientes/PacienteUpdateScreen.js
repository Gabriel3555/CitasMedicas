import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { updatePaciente } from '../../apis/pacientesApi';
import { getEps } from '../../apis/epsApi';

const PacienteUpdateScreen = ({ route, navigation }) => {
  const { paciente } = route.params;
  const [nombre, setNombre] = useState(paciente.nombre);
  const [email, setEmail] = useState(paciente.email || "");
  const [telefono, setTelefono] = useState(paciente.telefono || "");
  const [eps_id, setEpsId] = useState(paciente.eps_id?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [eps, setEps] = useState([]);

  useEffect(() => {
    const fetchEps = async () => {
      const result = await getEps();
      if (result.success) {
        setEps(result.data);
      }
    };
    fetchEps();
  }, []);

  const handleUpdate = async () => {
    if (!nombre || !email || !telefono || !eps_id) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    const result = await updatePaciente(paciente.id, { nombre, email, telefono, eps_id });
    setLoading(false);
    if (result.success) {
      Alert.alert('Éxito', 'Paciente actualizado exitosamente');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Paciente</Text>

      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} />

      <Text style={styles.label}>Seleccionar EPS:</Text>
      <Picker
        selectedValue={eps_id}
        onValueChange={(itemValue) => setEpsId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecciona una EPS" value="" />
        {eps.map((e) => (
          <Picker.Item key={e.id} label={e.nombre} value={e.id.toString()} />
        ))}
      </Picker>

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
  label: { fontSize: 16, marginBottom: 5 },
  picker: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default PacienteUpdateScreen;
