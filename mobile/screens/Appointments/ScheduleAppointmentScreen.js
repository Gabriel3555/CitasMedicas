import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { getDoctores } from '../../apis/doctoresApi';
import { createCita } from '../../apis/citasApi';

const ScheduleAppointmentScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    const fetchDoctors = async () => {
      const result = await getDoctores();
      if (result.success) {
        setDoctors(result.data);
      }
    };
    fetchDoctors();
  }, []);

  const handleSchedule = async () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Selecciona un doctor');
      return;
    }

    // Validate schedule: weekdays and within doctor's hours
    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      Alert.alert('Error', 'Las citas solo se pueden agendar de lunes a viernes');
      return;
    }

    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const startTime = selectedDoctor.start_time;
    const endTime = selectedDoctor.end_time;

    if (timeString < startTime || timeString >= endTime) {
      Alert.alert('Error', `Las citas deben ser entre ${startTime} y ${endTime}`);
      return;
    }

    const citaData = {
      doctor_id: selectedDoctor.id,
      fecha: selectedDate.toISOString().split('T')[0],
      hora: timeString,
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
        <Text style={styles.title}>Agendar Cita</Text>

        <Text style={styles.label}>Selecciona un Doctor:</Text>
        {doctors.map(doctor => (
          <TouchableOpacity
            key={doctor.id}
            style={[styles.doctorItem, selectedDoctor?.id === doctor.id && styles.selected]}
            onPress={() => setSelectedDoctor(doctor)}
          >
            <Text>{doctor.nombre} - {doctor.especialidad?.nombre}</Text>
            <Text>Horario: {doctor.start_time} - {doctor.end_time}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Fecha (YYYY-MM-DD):</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-09-23"
          value={selectedDate.toISOString().split('T')[0]}
          onChangeText={(text) => setSelectedDate(new Date(text))}
        />

        <Text style={styles.label}>Hora (HH:MM):</Text>
        <TextInput
          style={styles.input}
          placeholder="09:00"
          value={selectedTime.toTimeString().split(' ')[0]}
          onChangeText={(text) => {
            const [hours, minutes] = text.split(':');
            const newTime = new Date(selectedDate);
            newTime.setHours(parseInt(hours), parseInt(minutes));
            setSelectedTime(newTime);
          }}
        />

        <TouchableOpacity style={styles.button} onPress={handleSchedule}>
          <Text style={styles.buttonText}>Agendar</Text>
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
  label: { fontSize: 16, marginVertical: 10 },
  doctorItem: { padding: 10, borderWidth: 1, borderColor: "#ccc", marginVertical: 5 },
  selected: { backgroundColor: "#007AFF" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginVertical: 5, borderRadius: 8 },
  button: { backgroundColor: "#28a745", padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default ScheduleAppointmentScreen;