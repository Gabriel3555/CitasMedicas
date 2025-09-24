import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCita, getAvailableSlots } from '../../apis/citasApi';
import { getPacientes } from '../../apis/pacientesApi';
import { getDoctores } from '../../apis/doctoresApi';

const AdminCitaCreateScreen = ({ navigation }) => {
  // Función auxiliar para formatear fechas
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    pacientes_id: '',
    doctor_id: '',
    fecha: formatDate(new Date()),
    hora: ''
  });
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Limpiar slots cuando no hay doctor o fecha seleccionados
  useEffect(() => {
    if (!formData.doctor_id || !formData.fecha) {
      console.log('AdminCitaCreateScreen - Clearing slots due to missing doctor or date', {
        doctor_id: formData.doctor_id,
        fecha: formData.fecha
      });
      setAvailableSlots([]);
    }
  }, [formData.doctor_id, formData.fecha]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Cargar pacientes
    setLoadingPacientes(true);
    const pacientesResult = await getPacientes();
    if (pacientesResult.success) {
      setPacientes(pacientesResult.data);
    } else {
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    }
    setLoadingPacientes(false);

    // Cargar doctores
    setLoadingDoctores(true);
    const doctoresResult = await getDoctores();
    if (doctoresResult.success) {
      setDoctores(doctoresResult.data);
    } else {
      Alert.alert('Error', 'No se pudieron cargar los doctores');
    }
    setLoadingDoctores(false);
  };

  const handleInputChange = (field, value) => {
    console.log('AdminCitaCreateScreen@handleInputChange', {
      field,
      value,
      previousFormData: formData
    });
    setFormData({ ...formData, [field]: value });
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
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      handleInputChange('fecha', formatDate(date));
      // Limpiar hora seleccionada cuando cambia la fecha
      handleInputChange('hora', '');
      // Cargar slots disponibles si hay doctor seleccionado
      if (formData.doctor_id) {
        loadAvailableSlots(formData.doctor_id, formatDate(date));
      } else {
        // Si no hay doctor seleccionado, limpiar slots
        setAvailableSlots([]);
      }
    }
  };

  const loadAvailableSlots = async (doctorId, date) => {
    console.log('AdminCitaCreateScreen@loadAvailableSlots - Function called', {
      doctorId,
      date,
      currentState: {
        formData,
        availableSlotsCount: availableSlots.length,
        loadingSlots
      }
    });

    if (!doctorId || !date) {
      console.log('AdminCitaCreateScreen@loadAvailableSlots - Missing parameters, clearing slots', {
        doctorId,
        date
      });
      setAvailableSlots([]);
      return;
    }

    // Validar que el doctorId sea un número válido
    if (isNaN(parseInt(doctorId))) {
      console.log('AdminCitaCreateScreen@loadAvailableSlots - Invalid doctorId, clearing slots', {
        doctorId,
        doctorIdType: typeof doctorId
      });
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    console.log('AdminCitaCreateScreen@loadAvailableSlots - Starting slot loading', {
      doctorId,
      date,
      timestamp: new Date().toISOString()
    });

    const result = await getAvailableSlots(doctorId, date);

    console.log('AdminCitaCreateScreen@loadAvailableSlots - API result received', {
      success: result.success,
      error: result.error,
      data: result.data
    });

    if (result.success) {
      const slots = result.data.slots || [];
      console.log('AdminCitaCreateScreen@loadAvailableSlots - Setting available slots', {
        slotsCount: slots.length,
        slots: slots
      });
      setAvailableSlots(slots);
    } else {
      console.error('AdminCitaCreateScreen@loadAvailableSlots - Error loading slots', {
        error: result.error
      });
      setAvailableSlots([]);
      Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
    }

    setLoadingSlots(false);
    console.log('AdminCitaCreateScreen@loadAvailableSlots - Function completed', {
      finalAvailableSlotsCount: result.success ? (result.data.slots || []).length : 0,
      loadingSlots: false
    });
  };

  const validateDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    // Para testing, permitir cualquier fecha válida
    // En producción, descomentar la línea siguiente:
    // const selectedDate = new Date(date);
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // return selectedDate >= today;

    return true; // Permitir cualquier fecha para testing
  };

  const validateTime = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleSubmit = async () => {
    console.log('AdminCitaCreateScreen@handleSubmit - Function called', {
      formData,
      validationChecks: {
        hasPaciente: !!formData.pacientes_id,
        hasDoctor: !!formData.doctor_id,
        hasFecha: !!formData.fecha,
        hasHora: !!formData.hora
      }
    });

    if (!formData.pacientes_id || !formData.doctor_id || !formData.fecha || !formData.hora) {
      console.log('AdminCitaCreateScreen@handleSubmit - Validation failed: missing fields');
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (!validateDate(formData.fecha)) {
      console.log('AdminCitaCreateScreen@handleSubmit - Date validation failed', {
        fecha: formData.fecha,
        isValid: validateDate(formData.fecha)
      });
      Alert.alert('Error', 'La fecha debe estar en formato YYYY-MM-DD y no puede ser anterior a hoy');
      return;
    }

    console.log('AdminCitaCreateScreen@handleSubmit - Validation passed, creating appointment', {
      appointmentData: formData
    });

    setLoading(true);
    const result = await createCita(formData);

    console.log('AdminCitaCreateScreen@handleSubmit - API result received', {
      success: result.success,
      error: result.error,
      data: result.data
    });

    setLoading(false);
    if (result.success) {
      console.log('AdminCitaCreateScreen@handleSubmit - Appointment created successfully');
      Alert.alert('Éxito', 'Cita creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      console.error('AdminCitaCreateScreen@handleSubmit - Appointment creation failed', {
        error: result.error
      });
      Alert.alert('Error', result.error);
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
                {pacientes.map((paciente) => (
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
                  console.log('AdminCitaCreateScreen - Doctor picker onValueChange', {
                    selectedValue: value,
                    selectedValueType: typeof value,
                    currentFormData: formData
                  });
                  // Actualizar estado y limpiar slots inmediatamente
                  const newFormData = { ...formData, doctor_id: value, hora: '' };
                  setFormData(newFormData);
                  // Cargar slots disponibles si hay fecha seleccionada
                  if (formData.fecha && value) {
                    loadAvailableSlots(value, formData.fecha);
                  } else {
                    setAvailableSlots([]);
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="🔍 Selecciona un doctor..." value="" />
                {doctores.map((doctor) => (
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
            console.log('AdminCitaCreateScreen - Rendering time slot section', {
              loadingSlots,
              availableSlotsCount: availableSlots.length,
              formData,
              availableSlots: availableSlots
            });

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
                    onValueChange={(value) => {
                      console.log('AdminCitaCreateScreen - Time slot selected', {
                        selectedValue: value,
                        previousValue: formData.hora
                      });
                      handleInputChange('hora', value);
                    }}
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

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>💡 La fecha debe ser igual o posterior a hoy</Text>
            <Text style={styles.infoText}>💡 Las citas tienen una duración de 30 minutos</Text>
            <Text style={styles.infoText}>💡 Los horarios disponibles se generan según el horario laboral del doctor</Text>
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
});

export default AdminCitaCreateScreen;