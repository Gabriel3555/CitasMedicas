import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { updatePaciente } from '../../apis/pacientesApi';
import { getEps } from '../../apis/epsApi';

const AdminPacienteUpdateScreen = ({ navigation, route }) => {
  const { paciente } = route.params;
  const [formData, setFormData] = useState({
    nombre: paciente.nombre || '',
    email: paciente.email || '',
    telefono: paciente.telefono || '',
    eps_id: paciente.eps_id?.toString() || ''
  });
  const [epsList, setEpsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEPS();
  }, []);

  const fetchEPS = async () => {
    try {
      const result = await getEps();
      if (result.success) {
        setEpsList(result.data);
      } else {
        console.error('Error al cargar EPS:', result.error);
        Alert.alert('Error', 'No se pudieron cargar las EPS');
      }
    } catch (error) {
      console.error('Error en fetchEPS:', error);
      Alert.alert('Error', 'Error al conectar con el servidor');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.eps_id) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    const result = await updatePaciente(paciente.id, formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Paciente actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Actualizar Paciente</Text>

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
          <View style={styles.epsHeader}>
            <Text style={styles.label}>EPS</Text>
            <TouchableOpacity
              style={styles.reloadBtn}
              onPress={fetchEPS}
            >
              <Text style={styles.reloadBtnText}>🔄 Recargar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            {epsList.length === 0 ? (
              <View style={styles.noEpsContainer}>
                <Text style={styles.noEpsText}>
                  {epsList.length === 0 && !loading ? 'No hay EPS disponibles' : 'Cargando EPS...'}
                </Text>
              </View>
            ) : (
              epsList.map((eps) => (
                <TouchableOpacity
                  key={eps.id}
                  style={[
                    styles.epsOption,
                    formData.eps_id === eps.id.toString() && styles.epsOptionSelected
                  ]}
                  onPress={() => handleInputChange('eps_id', eps.id.toString())}
                >
                  <Text style={[
                    styles.epsOptionText,
                    formData.eps_id === eps.id.toString() && styles.epsOptionTextSelected
                  ]}>
                    {eps.nombre}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Actualizando...' : 'Actualizar Paciente'}
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
  epsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  reloadBtn: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3
  },
  reloadBtnText: { color: 'white', fontSize: 12 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  noEpsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noEpsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  epsOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  epsOptionSelected: { backgroundColor: '#007bff' },
  epsOptionText: { fontSize: 16 },
  epsOptionTextSelected: { color: 'white' },
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

export default AdminPacienteUpdateScreen;