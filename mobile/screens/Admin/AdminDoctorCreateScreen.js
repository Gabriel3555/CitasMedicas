import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { createDoctor } from '../../apis/doctoresApi';
import { getEspecialidades } from '../../apis/especialidadesApi';

const AdminDoctorCreateScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad_id: '',
    start_time: '',
    end_time: ''
  });
  const [especialidadesList, setEspecialidadesList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    const result = await getEspecialidades();
    if (result.success) {
      setEspecialidadesList(result.data);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.telefono ||
        !formData.especialidad_id || !formData.start_time || !formData.end_time) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    const result = await createDoctor(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Doctor creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Nuevo Doctor</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            placeholder="Ingrese el nombre completo"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange('telefono', value)}
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Especialidad</Text>
          <View style={styles.pickerContainer}>
            {especialidadesList.map((especialidad) => (
              <TouchableOpacity
                key={especialidad.id}
                style={[
                  styles.especialidadOption,
                  formData.especialidad_id === especialidad.id.toString() && styles.especialidadOptionSelected
                ]}
                onPress={() => handleInputChange('especialidad_id', especialidad.id.toString())}
              >
                <Text style={[
                  styles.especialidadOptionText,
                  formData.especialidad_id === especialidad.id.toString() && styles.especialidadOptionTextSelected
                ]}>
                  {especialidad.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hora de inicio</Text>
          <TextInput
            style={styles.input}
            value={formData.start_time}
            onChangeText={(value) => handleInputChange('start_time', value)}
            placeholder="08:00"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hora de fin</Text>
          <TextInput
            style={styles.input}
            value={formData.end_time}
            onChangeText={(value) => handleInputChange('end_time', value)}
            placeholder="17:00"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Creando...' : 'Crear Doctor'}
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
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  especialidadOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  especialidadOptionSelected: { backgroundColor: '#007bff' },
  especialidadOptionText: { fontSize: 16 },
  especialidadOptionTextSelected: { color: 'white' },
  submitBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default AdminDoctorCreateScreen;