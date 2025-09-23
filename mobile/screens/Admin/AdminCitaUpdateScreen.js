import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { updateCita } from '../../apis/citasApi';
import { getPacientes } from '../../apis/pacientesApi';
import { getDoctores } from '../../apis/doctoresApi';

const AdminCitaUpdateScreen = ({ navigation, route }) => {
  const { cita } = route.params;
  const [formData, setFormData] = useState({
    pacientes_id: cita.pacientes_id?.toString() || '',
    doctor_id: cita.doctor_id?.toString() || '',
    fecha: cita.fecha || '',
    hora: cita.hora || ''
  });
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [pacientesResult, doctoresResult] = await Promise.all([
      getPacientes(),
      getDoctores()
    ]);

    if (pacientesResult.success) setPacientes(pacientesResult.data);
    if (doctoresResult.success) setDoctores(doctoresResult.data);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.pacientes_id || !formData.doctor_id || !formData.fecha || !formData.hora) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    const result = await updateCita(cita.id, formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Cita actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Actualizar Cita</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Paciente</Text>
          <View style={styles.pickerContainer}>
            {pacientes.map((paciente) => (
              <TouchableOpacity
                key={paciente.id}
                style={[
                  styles.option,
                  formData.pacientes_id === paciente.id.toString() && styles.optionSelected
                ]}
                onPress={() => handleInputChange('pacientes_id', paciente.id.toString())}
              >
                <Text style={[
                  styles.optionText,
                  formData.pacientes_id === paciente.id.toString() && styles.optionTextSelected
                ]}>
                  {paciente.nombre} - {paciente.email}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor</Text>
          <View style={styles.pickerContainer}>
            {doctores.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={[
                  styles.option,
                  formData.doctor_id === doctor.id.toString() && styles.optionSelected
                ]}
                onPress={() => handleInputChange('doctor_id', doctor.id.toString())}
              >
                <Text style={[
                  styles.optionText,
                  formData.doctor_id === doctor.id.toString() && styles.optionTextSelected
                ]}>
                  Dr. {doctor.nombre} - {doctor.especialidad?.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            value={formData.fecha}
            onChangeText={(value) => handleInputChange('fecha', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hora</Text>
          <TextInput
            style={styles.input}
            value={formData.hora}
            onChangeText={(value) => handleInputChange('hora', value)}
            placeholder="HH:MM"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Actualizando...' : 'Actualizar Cita'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  form: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16
  },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, maxHeight: 150 },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  optionSelected: { backgroundColor: '#007bff' },
  optionText: { fontSize: 16 },
  optionTextSelected: { color: 'white' },
  submitBtn: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default AdminCitaUpdateScreen;