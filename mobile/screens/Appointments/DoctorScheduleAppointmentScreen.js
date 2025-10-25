import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { getPacientes, createCita } from '../../apis/citasApi';
import { me } from '../../apis/authApi';
import DateTimePicker from '@react-native-community/datetimepicker';

const DoctorScheduleAppointmentScreen = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [doctorSchedule, setDoctorSchedule] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const pacientesResult = await getPacientes();
      if (pacientesResult.success) {
        setPacientes(pacientesResult.data);
      }

      const userResult = await me();
      if (userResult.success && userResult.data.doctor_profile) {
        setDoctorSchedule({
          start_time: userResult.data.doctor_profile.start_time,
          end_time: userResult.data.doctor_profile.end_time
        });
      }
    };
    fetchData();
  }, []);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || new Date();
    setShowTimePicker(false);
    setSelectedTime(currentTime);
  };

  const handleSchedule = async () => {
    if (!selectedPaciente) {
      Alert.alert('Error', 'Selecciona un paciente');
      return;
    }

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      Alert.alert('Error', 'Las citas solo se pueden agendar de lunes a viernes');
      return;
    }

    if (doctorSchedule && doctorSchedule.start_time && doctorSchedule.end_time) {
      const appointmentTime = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      const startTime = doctorSchedule.start_time.substring(0, 5);
      const endTime = doctorSchedule.end_time.substring(0, 5);

      if (appointmentTime < startTime || appointmentTime >= endTime) {
        Alert.alert('Error', `La hora seleccionada está fuera de su horario laboral (${startTime} - ${endTime})`);
        return;
      }
    }

    const citaData = {
      pacientes_id: selectedPaciente.id,
      fecha: selectedDate.toISOString().split('T')[0],
      hora: selectedTime.toTimeString().split(' ')[0].substring(0, 5),
    };

    const result = await createCita(citaData);
    if (result.success) {
      Alert.alert('Éxito', 'Cita agendada exitosamente');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={150}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Agendar Cita para Paciente</Text>

        {doctorSchedule && doctorSchedule.start_time && doctorSchedule.end_time && (
          <Text style={styles.scheduleInfo}>
            Su horario laboral: {doctorSchedule.start_time.substring(0, 5)} - {doctorSchedule.end_time.substring(0, 5)}
          </Text>
        )}

        <Text style={styles.label}>Selecciona un Paciente:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPaciente?.id || ''}
            onValueChange={(itemValue) => {
              const paciente = pacientes.find(p => p.id === itemValue);
              setSelectedPaciente(paciente);
            }}
            style={styles.picker}
            color="#000"
          >
            <Picker.Item label="Selecciona un paciente..." value="" />
            {pacientes.map(paciente => (
              <Picker.Item
                key={paciente.id}
                label={`${paciente.nombre} - ${paciente.email}`}
                value={paciente.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Fecha:</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.pickerButtonText}>
            {selectedDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Hora:</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.pickerButtonText}>
            {selectedTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSchedule}>
          <Text style={styles.buttonText}>Agendar Cita</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  scheduleInfo: { fontSize: 16, color: '#007AFF', textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  label: { fontSize: 16, marginVertical: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: "#f8f9fa"
  },
  picker: { height: 50, width: '100%', color: '#000' },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#007AFF",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center"
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500"
  },
  button: { backgroundColor: "#28a745", padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default DoctorScheduleAppointmentScreen;