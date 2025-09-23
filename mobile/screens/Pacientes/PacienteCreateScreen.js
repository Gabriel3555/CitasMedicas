import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { createPaciente } from '../../apis/pacientesApi';
import { getEps } from '../../apis/epsApi';

const PacienteCreateScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [eps_id, setEpsId] = useState("");
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

  const handleCreate = async () => {
    if (!nombre || !documento || !email || !telefono || !eps_id) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    const result = await createPaciente({ nombre, documento, email, telefono, eps_id });
    setLoading(false);
    if (result.success) {
      Alert.alert('Éxito', 'Paciente creado exitosamente');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Paciente</Text>

      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Documento" value={documento} onChangeText={setDocumento} />
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
  label: { fontSize: 16, marginBottom: 5 },
  picker: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#28a745", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default PacienteCreateScreen;
