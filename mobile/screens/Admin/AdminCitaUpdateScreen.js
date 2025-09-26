import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateCita, getAvailableSlots } from '../../apis/citasApi';
import { getPacientes } from '../../apis/pacientesApi';
import { getDoctores } from '../../apis/doctoresApi';

const AdminCitaUpdateScreen = ({ navigation, route }) => {
  const { cita } = route.params;
  
  // Función auxiliar para formatear fechas
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    pacientes_id: cita.pacientes_id?.toString() || '',
    doctor_id: cita.doctor_id?.toString() || '',
    fecha: cita.fecha || '',
    hora: cita.hora || ''
  });
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    cita.fecha ? new Date(cita.fecha + 'T00:00:00') : new Date()
  );

  useEffect(() => {
    fetchData();
    // Cargar slots disponibles si ya hay doctor y fecha seleccionados
    if (formData.doctor_id && formData.fecha) {
      loadAvailableSlots(formData.doctor_id, formData.fecha);
    }
  }, []);

  const fetchData = async () => {
    const [pacientesResult, doctoresResult] = await Promise.all([
      getPacientes(),
      getDoctores()
    ]);

    if (pacientesResult.success) setPacientes(pacientesResult.data);
    if (doctoresResult.success) setDoctores(doctoresResult.data);
  };

  const loadAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    const result = await getAvailableSlots(doctorId, date);

    if (result.success) {
      let slots = result.data.slots || [];

      // Si estamos editando la misma cita, incluir la hora actual como disponible
      if (cita.doctor_id.toString() === doctorId && cita.fecha === date) {
        const currentSlot = {
          hora: cita.hora,
          hora_fin: cita.hora, // Simplificado
          label: `${cita.hora} (Hora actual)`,
          disponible: true
        };

        // Verificar si la hora actual ya está en los slots disponibles
        const existingSlot = slots.find(slot => slot.hora === cita.hora);
        if (!existingSlot) {
          slots.unshift(currentSlot); // Agregar al inicio
        }
      }

      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
      Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
    }

    setLoadingSlots(false);
  };

  const validateDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const selectedDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Si cambia el doctor, limpiar hora y recargar slots
    if (field === 'doctor_id') {
      setFormData(prev => ({ ...prev, [field]: value, hora: '' }));
      if (formData.fecha && value) {
        loadAvailableSlots(value, formData.fecha);
      } else {
        setAvailableSlots([]);
      }
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const formattedDate = formatDate(date);
      setSelectedDate(date);
      setFormData({ ...formData, fecha: formattedDate, hora: '' });
      
      // Cargar slots disponibles si hay doctor seleccionado
      if (formData.doctor_id) {
        loadAvailableSlots(formData.doctor_id, formattedDate);
      } else {
        setAvailableSlots([]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.pacientes_id || !formData.doctor_id || !formData.fecha || !formData.hora) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (!validateDate(formData.fecha)) {
      Alert.alert('Error', 'La fecha debe estar en formato YYYY-MM-DD y no puede ser anterior a hoy');
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
          <Text style={styles.label}>Paciente *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.pacientes_id}
              onValueChange={(value) => handleInputChange('pacientes_id', value)}
              style={styles.picker}
            >
              <Picker.Item label="🔍 Seleccionar paciente..." value="" />
              {pacientes.map((paciente) => (
                <Picker.Item
                  key={paciente.id}
                  label={`${paciente.nombre} - ${paciente.email || 'Sin email'}`}
                  value={paciente.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.doctor_id}
              onValueChange={(value) => handleInputChange('doctor_id', value)}
              style={styles.picker}
            >
              <Picker.Item label="🔍 Seleccionar doctor..." value="" />
              {doctores.map((doctor) => (
                <Picker.Item
                  key={doctor.id}
                  label={`Dr. ${doctor.nombre} - ${doctor.especialidad?.nombre || 'Sin especialidad'}`}
                  value={doctor.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de la Cita *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.fecha ? `📅 ${formData.fecha}` : '📅 Seleccionar fecha...'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hora de la Cita *</Text>
          {(() => {
            if (loadingSlots) {
              return (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Cargando horarios disponibles...</Text>
                </View>
              );
            } else if (availableSlots.length > 0) {
              return (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.hora}
                    onValueChange={(value) => handleInputChange('hora', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="🕐 Selecciona una hora..." value="" />
                    {availableSlots.map((slot, index) => (
                      <Picker.Item
                        key={index}
                        label={slot.label}
                        value={slot.hora}
                      />
                    ))}
                  </Picker>
                </View>
              );
            } else {
              return (
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    {formData.doctor_id && formData.fecha ? '⏰ No hay horarios disponibles para esta fecha' : '💡 Selecciona un doctor y fecha para ver horarios disponibles'}
                  </Text>
                </View>
              );
            }
          })()}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>💡 Los campos marcados con * son obligatorios</Text>
          <Text style={styles.infoText}>💡 La fecha debe ser igual o posterior a hoy</Text>
          <Text style={styles.infoText}>💡 Los horarios disponibles se generan según el horario laboral del doctor</Text>
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

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={handleDateChange}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // Máximo 1 año en el futuro
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: "#2c3e50" },
  form: { backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: "#2c3e50" },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16
  },
  dateButton: {
    borderWidth: 2,
    borderColor: "#bdc3c7",
    padding: 15,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: "#ecf0f1",
    alignItems: "center"
  },
  dateButtonText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center"
  },
  pickerContainer: { borderWidth: 2, borderColor: '#bdc3c7', borderRadius: 10, backgroundColor: "#ecf0f1" },
  picker: { height: 50, color: "#2c3e50" },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    borderRadius: 10,
    marginBottom: 5
  },
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
    fontStyle: "italic"
  },
  infoContainer: {
    backgroundColor: "#e8f4f8",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  infoText: {
    fontSize: 14,
    color: "#2980b9",
    marginBottom: 5
  },
  submitBtn: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  submitBtnDisabled: { backgroundColor: '#ccc', shadowOpacity: 0 },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default AdminCitaUpdateScreen;