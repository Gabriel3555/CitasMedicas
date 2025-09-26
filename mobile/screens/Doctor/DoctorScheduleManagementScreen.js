import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { me } from '../../apis/authApi';
import { updateMySchedule } from '../../apis/doctoresApi';

const DoctorScheduleManagementScreen = ({ navigation }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startTimeDate, setStartTimeDate] = useState(new Date());
  const [endTimeDate, setEndTimeDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctorData, setDoctorData] = useState(null);

  useEffect(() => {
    loadDoctorSchedule();
  }, []);

  const loadDoctorSchedule = async () => {
    const result = await me();
    if (result.success && result.data.doctor_profile) {
      const doctor = result.data.doctor_profile;
      setDoctorData(doctor);

      const startTimeStr = doctor.start_time || '09:00';
      const endTimeStr = doctor.end_time || '17:00';

      setStartTime(startTimeStr);
      setEndTime(endTimeStr);

      const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
      const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0, 0);
      setStartTimeDate(startDate);

      const endDate = new Date();
      endDate.setHours(endHours, endMinutes, 0, 0);
      setEndTimeDate(endDate);
    } else {
      Alert.alert('Error', 'No se pudo cargar la información del doctor');
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const onStartTimeChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartTimeDate(selectedDate);
      setStartTime(formatTime(selectedDate));
    }
  };

  const onEndTimeChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndTimeDate(selectedDate);
      setEndTime(formatTime(selectedDate));
    }
  };

  const handleSaveSchedule = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Error', 'Por favor complete ambos campos de horario');
      return;
    }

    const start = startTimeDate.getTime();
    const end = endTimeDate.getTime();

    if (start >= end) {
      Alert.alert('Error', 'La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    setLoading(true);

    const result = await updateMySchedule({
      start_time: startTime,
      end_time: endTime,
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Éxito', 'Horario actualizado exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', `Error al actualizar horario: ${result.error}`);
      console.log('Schedule update error:', result);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <Text style={styles.title}>⏰ Gestionar Horario</Text>
          <Text style={styles.subtitle}>Configure sus horas de trabajo</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hora de Inicio</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.timePickerText}>{startTime}</Text>
              <Text style={styles.timePickerIcon}>🕐</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>Toca para seleccionar la hora</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hora de Fin</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.timePickerText}>{endTime}</Text>
              <Text style={styles.timePickerIcon}>🕐</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>Toca para seleccionar la hora</Text>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startTimeDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onStartTimeChange}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endTimeDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onEndTimeChange}
            />
          )}

          {doctorData && (
            <View style={styles.currentScheduleContainer}>
              <Text style={styles.currentScheduleTitle}>Horario Actual:</Text>
              <Text style={styles.currentScheduleText}>
                {doctorData.start_time && doctorData.end_time
                  ? `${doctorData.start_time} - ${doctorData.end_time}`
                  : 'No configurado'
                }
              </Text>
            </View>
          )}

          <Animatable.View animation="pulse" duration={600} delay={400}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSaveSchedule}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Guardando...' : '💾 Guardar Horario'}
              </Text>
            </TouchableOpacity>
          </Animatable.View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>⬅️ Volver</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  timePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 16,
    color: '#333',
  },
  timePickerIcon: {
    fontSize: 18,
  },
  helperText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  currentScheduleContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  currentScheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  currentScheduleText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DoctorScheduleManagementScreen;