import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCita, getAvailableSlots } from '../../apis/citasApi';
import { getPacientes } from '../../apis/pacientesApi';
import { getDoctores } from '../../apis/doctoresApi';
import { getEspecialidades } from '../../apis/especialidadesApi';

const AdminCitaCreateScreen = ({ navigation }) => {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    pacientes_id: '',
    doctor_id: '',
    fecha: formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    hora: ''
  });
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [selectedEspecialidadId, setSelectedEspecialidadId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);

  useEffect(() => {
    try {
      if (!formData || !formData.doctor_id || !formData.fecha) {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setAvailableSlots([]);
    }
  }, [formData && formData.doctor_id, formData && formData.fecha]);

  useEffect(() => {
    try {
      fetchData();
    } catch (error) {
      console.error('Error in main useEffect:', error);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoadingPacientes(true);
      try {
        const pacientesResult = await getPacientes();
        if (pacientesResult && pacientesResult.success) {
          setPacientes(pacientesResult.data || []);
        } else {
          Alert.alert('Error', 'No se pudieron cargar los pacientes');
        }
      } catch (error) {
        console.error('Error fetching pacientes:', error);
      } finally {
        setLoadingPacientes(false);
      }

      setLoadingEspecialidades(true);
      try {
        const especialidadesResult = await getEspecialidades();
        if (especialidadesResult && especialidadesResult.success) {
          setEspecialidades(especialidadesResult.data || []);
        } else {
          Alert.alert('Error', 'No se pudieron cargar las especialidades');
        }
      } catch (error) {
        console.error('Error fetching especialidades:', error);
      } finally {
        setLoadingEspecialidades(false);
      }

      await fetchDoctores();
    } catch (error) {
      console.error('Error in fetchData:', error);
      setLoadingPacientes(false);
      setLoadingEspecialidades(false);
    }
  };

  const fetchDoctores = async (especialidadId = null) => {
    try {
      setLoadingDoctores(true);
      const doctoresResult = await getDoctores(especialidadId);
      if (doctoresResult && doctoresResult.success) {
        setDoctores(doctoresResult.data || []);
        if (formData && formData.doctor_id && doctoresResult.data && !doctoresResult.data.find(d => d && d.id && d.id.toString() === formData.doctor_id)) {
          setFormData(prevData => ({ ...prevData, doctor_id: '', hora: '' }));
          setAvailableSlots([]);
        }
      } else {
        setDoctores([]);
        Alert.alert('Error', 'No se pudieron cargar los doctores');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctores([]);
    } finally {
      setLoadingDoctores(false);
    }
  };

  const handleInputChange = (field, value) => {
    try {
      setFormData(prevData => ({ ...prevData, [field]: value }));
    } catch (error) {
      console.error('Error updating form data:', error);
    }
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    handleInputChange('fecha', formatDate(date));
    setShowDatePicker(false);
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {
    try {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        handleInputChange('fecha', formatDate(date));
        handleInputChange('hora', '');
        if (formData && formData.doctor_id) {
          loadAvailableSlots(formData.doctor_id, formatDate(date));
        } else {
          setAvailableSlots([]);
        }
      }
    } catch (error) {
      console.error('Error in handleDateChange:', error);
      setShowDatePicker(false);
    }
  };

  const loadAvailableSlots = async (doctorId, date) => {
    try {
      if (!doctorId || !date) {
        setAvailableSlots([]);
        return;
      }

      if (isNaN(parseInt(doctorId))) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);

      const result = await getAvailableSlots(doctorId, date);
      if (result && result.success) {
        const slots = result.data && result.data.slots ? result.data.slots : [];
        setAvailableSlots(slots);
      } else {
        setAvailableSlots([]);
        Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validateDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    return true;
  };

  const validateTime = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(time);
  };

  const handleSubmit = async () => {
    // Validar y enviar la nueva cita
    try {
      if (!formData || !formData.pacientes_id || !formData.doctor_id || !formData.fecha || !formData.hora) {
        Alert.alert('Error', 'Todos los campos son obligatorios');
        return;
      }

      if (!validateDate(formData.fecha)) {
        Alert.alert('Error', 'La fecha debe estar en formato YYYY-MM-DD y no puede ser hoy o anterior');
        return;
      }

      const today = formatDate(new Date());
      if (formData.fecha <= today) {
        Alert.alert('Error', 'No puede agendar citas el día presente, solo el siguiente al presente');
        return;
      }

      setLoading(true);
      const result = await createCita(formData);
      if (result && result.success) {
        Alert.alert('Éxito', 'Cita creada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', (result && result.error) || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('Error creating cita:', error);
      Alert.alert('Error', 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear Nueva Cita</Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>👥 Información del Paciente</Text>

          <Text style={styles.label}>Seleccionar Paciente:</Text>
          {loadingPacientes ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando pacientes...</Text>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.pacientes_id}
                onValueChange={(value) => handleInputChange('pacientes_id', value)}
                style={styles.picker}
              >
                <Picker.Item label="🔍 Selecciona un paciente..." value="" />
                {pacientes && pacientes.map((paciente) => (
                  <Picker.Item
                    key={paciente.id}
                    label={`${paciente.nombre} - ${paciente.email || 'Sin email'} (${paciente.eps?.nombre || 'Sin EPS'})`}
                    value={paciente.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>👨‍⚕️ Información del Doctor</Text>

          <Text style={styles.label}>Seleccionar Especialidad:</Text>
          {loadingEspecialidades ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando especialidades...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowSpecialtyModal(true)}
            >
              <Text style={styles.pickerText}>
                {selectedEspecialidad ? `🏥 ${selectedEspecialidad.nombre}` : '🏥 Todas las especialidades...'}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>Seleccionar Doctor:</Text>
          {loadingDoctores ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando doctores...</Text>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.doctor_id}
                onValueChange={(value) => {
                  try {
                    const newFormData = { ...formData, doctor_id: value, hora: '' };
                    setFormData(newFormData);
                    if (formData && formData.fecha && value) {
                      loadAvailableSlots(value, formData.fecha);
                    } else {
                      setAvailableSlots([]);
                    }
                  } catch (error) {
                    console.error('Error in doctor selection:', error);
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="🔍 Selecciona un doctor..." value="" />
                {doctores && doctores.map((doctor) => (
                  <Picker.Item
                    key={doctor.id}
                    label={`Dr. ${doctor.nombre} - ${doctor.email || 'Sin email'} (${doctor.especialidad?.nombre || 'Sin especialidad'})`}
                    value={doctor.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>📅 Información de la Cita</Text>

          <Text style={styles.label}>Fecha de la Cita:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={handleDatePress}
          >
            <Text style={styles.dateButtonText}>
              {formData.fecha ? `📅 ${formData.fecha}` : '📅 Seleccionar fecha...'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Hora de la Cita:</Text>
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
                    {availableSlots && availableSlots.map((slot, index) => (
                      <Picker.Item
                        key={index}
                        label={slot.label || 'Horario no disponible'}
                        value={slot.hora || ''}
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

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>💡 La fecha debe ser posterior a hoy</Text>
            <Text style={styles.infoText}>💡 Las citas tienen una duración de 30 minutos</Text>
            <Text style={styles.infoText}>💡 Los horarios disponibles se generan automáticamente en intervalos de 30 minutos</Text>
            <Text style={styles.infoText}>💡 Se excluyen automáticamente los horarios ya ocupados</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? '⏳ Creando Cita...' : '✅ Crear Cita'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
        />
      )}

      <Modal
        visible={showSpecialtyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSpecialtyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Especialidad</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedEspecialidadId('');
                  setSelectedEspecialidad(null);
                  fetchDoctores(null);
                  setShowSpecialtyModal(false);
                }}
              >
                <Text style={styles.modalItemText}>🏥 Todas las especialidades...</Text>
              </TouchableOpacity>
              {especialidades && especialidades.map(especialidad => (
                <TouchableOpacity
                  key={especialidad.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedEspecialidadId(especialidad.id.toString());
                    setSelectedEspecialidad(especialidad);
                    fetchDoctores(especialidad.id.toString());
                    setShowSpecialtyModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{especialidad.nombre || 'Especialidad sin nombre'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowSpecialtyModal(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#2c3e50"
  },
  formSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#34495e",
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
    paddingBottom: 8
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50"
  },
  input: {
    borderWidth: 2,
    borderColor: "#bdc3c7",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#ecf0f1"
  },
  dateButton: {
    borderWidth: 2,
    borderColor: "#bdc3c7",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#ecf0f1",
    alignItems: "center"
  },
  dateButtonText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center"
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#bdc3c7",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#ecf0f1"
  },
  picker: {
    height: 50,
    color: "#2c3e50"
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    borderRadius: 10,
    marginBottom: 15
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
    backgroundColor: "#27ae60",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  submitBtnDisabled: {
    backgroundColor: "#95a5a6",
    shadowOpacity: 0
  },
  submitBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  pickerText: {
    fontSize: 16,
    color: "#2c3e50",
    paddingVertical: 15,
    paddingHorizontal: 10
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  modalItemText: {
    fontSize: 16
  },
  modalClose: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
    alignItems: 'center'
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16
  },
});

export default AdminCitaCreateScreen;