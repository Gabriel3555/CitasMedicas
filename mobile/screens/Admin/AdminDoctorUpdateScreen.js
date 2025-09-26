import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { updateDoctor } from '../../apis/doctoresApi';
import { getEspecialidades } from '../../apis/especialidadesApi';
import { getEps } from '../../apis/epsApi';
import { adminChangeUserPassword } from '../../apis/authApi';

const AdminDoctorUpdateScreen = ({ navigation, route }) => {
  const { doctor } = route.params;
  const [formData, setFormData] = useState({
    nombre: doctor.nombre || '',
    email: doctor.email || '',
    telefono: doctor.telefono || '',
    especialidad_id: doctor.especialidad_id?.toString() || '',
    eps_id: doctor.eps_id?.toString() || ''
  });
  const [especialidadesList, setEspecialidadesList] = useState([]);
  const [epsList, setEpsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchEspecialidades();
    fetchEPS();
  }, []);

  const fetchEspecialidades = async () => {
    const result = await getEspecialidades();
    if (result.success) {
      setEspecialidadesList(result.data);
    }
  };

  const fetchEPS = async () => {
    const result = await getEps();
    if (result.success) {
      setEpsList(result.data);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.telefono ||
        !formData.especialidad_id || !formData.eps_id) {
      Alert.alert('Error', 'Los campos marcados con * son obligatorios');
      return;
    }

    setLoading(true);
    const result = await updateDoctor(doctor.id, formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Doctor actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    const result = await adminChangeUserPassword(doctor.user_id, newPassword, confirmPassword);
    setChangingPassword(false);

    if (result.success) {
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Actualizar Doctor</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            placeholder="Ingrese el nombre completo"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
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
          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange('telefono', value)}
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Especialidad *</Text>
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
          <Text style={styles.label}>EPS *</Text>
          <View style={styles.pickerContainer}>
            {epsList.map((eps) => (
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
            ))}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>💡 Los campos marcados con * son obligatorios</Text>
          <Text style={styles.infoText}>💡 Para configurar horarios, usa el botón "⏰ Horario" en la lista de doctores</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Actualizando...' : 'Actualizar Doctor'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changePasswordBtn}
          onPress={() => setShowPasswordModal(true)}
        >
          <Text style={styles.changePasswordBtnText}>🔒 Cambiar Contraseña</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            <Text style={styles.modalSubtitle}>Usuario: {doctor.email}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar nueva contraseña"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                <Text style={styles.confirmButtonText}>
                  {changingPassword ? 'Cambiando...' : 'Cambiar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  epsOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  epsOptionSelected: { backgroundColor: '#28a745' },
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
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  changePasswordBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  changePasswordBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  infoText: {
    fontSize: 14,
    color: '#2980b9',
    marginBottom: 5
  }
});

export default AdminDoctorUpdateScreen;