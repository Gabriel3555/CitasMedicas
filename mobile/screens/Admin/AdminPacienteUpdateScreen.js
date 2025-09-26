import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { updatePaciente } from '../../apis/pacientesApi';
import { getEps } from '../../apis/epsApi';
import { adminChangeUserPassword } from '../../apis/authApi';

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchEPS();
  }, []);

  const fetchEPS = async () => {
    try {
      const result = await getEps();
      if (result.success) {
        setEpsList(result.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las EPS');
      }
    } catch (error) {
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
    const result = await adminChangeUserPassword(paciente.user_id, newPassword, confirmPassword);
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
            <Text style={styles.modalSubtitle}>Usuario: {paciente.email}</Text>

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
  }
});

export default AdminPacienteUpdateScreen;