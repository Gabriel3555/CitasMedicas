import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from "react-native";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createCita, getAvailableSlots } from '../../apis/citasApi';
import { getPacientes } from '../../apis/pacientesApi';
import { getDoctores } from '../../apis/doctoresApi';

const CitaCreateScreen = ({ navigation }) => {
  // Función auxiliar para formatear fechas
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [pacientes_id, setPacientesId] = useState("");
  const [doctor_id, setDoctorId] = useState("");
  const [fecha, setFecha] = useState(formatDate(new Date()));
  const [hora, setHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
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
    fetchData();
  }, []);

  const validateDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const selectedDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
  };

  const handleDateConfirm = (date) => {
    console.log('Date selected:', date);
    console.log('Formatted date:', formatDate(date));
    setSelectedDate(date);
    setFecha(formatDate(date));
    setShowDatePicker(false);
  };

  const handleDatePress = () => {
    console.log('DatePicker opening...');
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      console.log('Date selected:', date);
      console.log('Formatted date:', formatDate(date));
      setSelectedDate(date);
      setFecha(formatDate(date));
      // Limpiar hora seleccionada cuando cambia la fecha
      setHora("");
      // Cargar slots disponibles si hay doctor seleccionado
      if (doctor_id) {
        loadAvailableSlots(doctor_id, formatDate(date));
      }
    }
  };

  const loadAvailableSlots = async (doctorId, date) => {
    console.log('CitaCreateScreen@loadAvailableSlots - Function called', {
      doctorId,
      date,
      currentState: {
        doctor_id,
        fecha,
        availableSlotsCount: availableSlots.length,
        loadingSlots
      }
    });

    if (!doctorId || !date) {
      console.log('CitaCreateScreen@loadAvailableSlots - Missing parameters, returning early', {
        doctorId,
        date
      });
      return;
    }

    setLoadingSlots(true);
    console.log('CitaCreateScreen@loadAvailableSlots - Starting slot loading', {
      doctorId,
      date,
      timestamp: new Date().toISOString()
    });

    const result = await getAvailableSlots(doctorId, date);

    console.log('CitaCreateScreen@loadAvailableSlots - API result received', {
      success: result.success,
      error: result.error,
      data: result.data
    });

    if (result.success) {
      const slots = result.data.slots || [];
      console.log('CitaCreateScreen@loadAvailableSlots - Setting available slots', {
        slotsCount: slots.length,
        slots: slots
      });
      setAvailableSlots(slots);
    } else {
      console.error('CitaCreateScreen@loadAvailableSlots - Error loading slots', {
        error: result.error
      });
      setAvailableSlots([]);
      Alert.alert('Error', 'No se pudieron cargar los horarios disponibles');
    }

    setLoadingSlots(false);
    console.log('CitaCreateScreen@loadAvailableSlots - Function completed', {
      finalAvailableSlotsCount: result.success ? (result.data.slots || []).length : 0,
      loadingSlots: false
    });
  };

  const handleCreate = async () => {
    console.log('CitaCreateScreen@handleCreate - Function called', {
      formData: {
        pacientes_id,
        doctor_id,
        fecha,
        hora
      },
      validationChecks: {
        hasPaciente: !!pacientes_id,
        hasDoctor: !!doctor_id,
        hasFecha: !!fecha,
        hasHora: !!hora
      }
    });

    if (!pacientes_id || !doctor_id || !fecha || !hora) {
      console.log('CitaCreateScreen@handleCreate - Validation failed: missing fields');
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!validateDate(fecha)) {
      console.log('CitaCreateScreen@handleCreate - Date validation failed', {
        fecha,
        isValid: validateDate(fecha)
      });
      Alert.alert('Error', 'La fecha debe estar en formato YYYY-MM-DD y no puede ser anterior a hoy');
      return;
    }

    console.log('CitaCreateScreen@handleCreate - Validation passed, creating appointment', {
      appointmentData: { pacientes_id, doctor_id, fecha, hora }
    });

    setLoading(true);
    const result = await createCita({ pacientes_id, doctor_id, fecha, hora });

    console.log('CitaCreateScreen@handleCreate - API result received', {
      success: result.success,
      error: result.error,
      data: result.data
    });

    setLoading(false);
    if (result.success) {
      console.log('CitaCreateScreen@handleCreate - Appointment created successfully');
      Alert.alert('Éxito', 'Cita creada exitosamente');
      navigation.goBack();
    } else {
      console.error('CitaCreateScreen@handleCreate - Appointment creation failed', {
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
                selectedValue={pacientes_id}
                onValueChange={(itemValue) => setPacientesId(itemValue)}
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
                selectedValue={doctor_id}
                onValueChange={(itemValue) => {
                  setDoctorId(itemValue);
                  // Limpiar hora cuando cambia el doctor
                  setHora("");
                  // Cargar slots disponibles si hay fecha seleccionada
                  if (fecha && itemValue) {
                    loadAvailableSlots(itemValue, fecha);
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
                    label={`${doctor.nombre} - ${doctor.email || 'Sin email'} (${doctor.especialidad?.nombre || 'Sin especialidad'})`}
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
              {fecha ? `📅 ${fecha}` : '📅 Seleccionar fecha...'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Hora de la Cita:</Text>
          {(() => {
            console.log('CitaCreateScreen - Rendering time slot section', {
              loadingSlots,
              availableSlotsCount: availableSlots.length,
              doctor_id,
              fecha,
              hora,
              availableSlots: availableSlots
            });

            if (loadingSlots) {
              console.log('CitaCreateScreen - Showing loading state');
              return (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Cargando horarios disponibles...</Text>
                </View>
              );
            } else if (availableSlots.length > 0) {
              console.log('CitaCreateScreen - Showing slots dropdown', {
                slotsCount: availableSlots.length,
                selectedHora: hora
              });
              return (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={hora}
                    onValueChange={(itemValue) => {
                      console.log('CitaCreateScreen - Time slot selected', {
                        selectedValue: itemValue,
                        previousValue: hora
                      });
                      setHora(itemValue);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="🕐 Selecciona una hora..." value="" />
                    {availableSlots.map((slot, index) => {
                      console.log('CitaCreateScreen - Rendering slot option', {
                        index,
                        slot: slot
                      });
                      return (
                        <Picker.Item
                          key={index}
                          label={slot.label}
                          value={slot.hora}
                        />
                      );
                    })}
                  </Picker>
                </View>
              );
            } else {
              const message = doctor_id && fecha ? '⏰ No hay horarios disponibles para esta fecha' : '💡 Selecciona un doctor y fecha para ver horarios disponibles';
              console.log('CitaCreateScreen - Showing info message', {
                message,
                hasDoctor: !!doctor_id,
                hasFecha: !!fecha
              });
              return (
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>{message}</Text>
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
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
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
  button: {
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
  buttonDisabled: {
    backgroundColor: "#95a5a6",
    shadowOpacity: 0
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
});

export default CitaCreateScreen;
