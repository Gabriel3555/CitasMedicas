import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateDoctor } from '../../apis/doctoresApi';

const AdminDoctorScheduleScreen = ({ navigation, route }) => {
  const { doctor } = route.params;
  const [formData, setFormData] = useState({
    nombre: doctor.nombre || '',
    email: doctor.email || '',
    telefono: doctor.telefono || '',
    especialidad_id: doctor.especialidad_id?.toString() || '',
    eps_id: doctor.eps_id?.toString() || '',
    start_time: doctor.start_time || '',
    end_time: doctor.end_time || ''
  });
  const [loading, setLoading] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTimeDate, setStartTimeDate] = useState(
    doctor.start_time ? new Date(`2000-01-01T${doctor.start_time}:00`) : new Date()
  );
  const [endTimeDate, setEndTimeDate] = useState(
    doctor.end_time ? new Date(`2000-01-01T${doctor.end_time}:00`) : new Date()
  );

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleStartTimeChange = (event, selectedDate) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      setStartTimeDate(selectedDate);
      const timeString = formatTime(selectedDate);
      setFormData({ ...formData, start_time: timeString });

      if (formData.end_time) {
        const startTime = new Date(`2000-01-01T${timeString}:00`);
        const endTime = new Date(`2000-01-01T${formData.end_time}:00`);

        if (startTime >= endTime) {
          Alert.alert(
            'Advertencia',
            'La hora de inicio no puede ser igual o posterior a la hora de fin. Se ha limpiado la hora de fin.',
            [{ text: 'OK' }]
          );
          setFormData(prev => ({ ...prev, start_time: timeString, end_time: '' }));
          setEndTimeDate(new Date());
        }
      }
    }
  };

  const handleEndTimeChange = (event, selectedDate) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      const timeString = formatTime(selectedDate);

      if (formData.start_time) {
        const startTime = new Date(`2000-01-01T${formData.start_time}:00`);
        const endTime = new Date(`2000-01-01T${timeString}:00`);

        if (endTime <= startTime) {
          Alert.alert(
            'Error',
            'La hora de fin debe ser posterior a la hora de inicio.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      setEndTimeDate(selectedDate);
      setFormData({ ...formData, end_time: timeString });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateTime = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleSubmit = async () => {
    console.log('AdminDoctorScheduleScreen: Starting handleSubmit');
    console.log('Current formData:', formData);

    if (!formData.start_time && !formData.end_time) {
      console.log('Validation failed: No schedule configured');
      Alert.alert('Error', 'Debe configurar al menos un horario de trabajo');
      return;
    }

    if (formData.start_time && !validateTime(formData.start_time)) {
      console.log('Validation failed: Invalid start_time format', formData.start_time);
      Alert.alert('Error', 'Formato de hora de inicio inválido. Use HH:MM (ej: 08:00)');
      return;
    }

    if (formData.end_time && !validateTime(formData.end_time)) {
      console.log('Validation failed: Invalid end_time format', formData.end_time);
      Alert.alert('Error', 'Formato de hora de fin inválido. Use HH:MM (ej: 17:00)');
      return;
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}:00`);
      const end = new Date(`2000-01-01T${formData.end_time}:00`);

      if (start >= end) {
        console.log('Validation failed: start_time >= end_time', { start: formData.start_time, end: formData.end_time });
        Alert.alert('Error', 'La hora de inicio debe ser anterior a la hora de fin');
        return;
      }
    }

    console.log('Validation passed, preparing to send data');
    setLoading(true);

    const scheduleData = {
      start_time: formData.start_time,
      end_time: formData.end_time
    };

    console.log('Sending scheduleData:', scheduleData);
    console.log('Doctor ID:', doctor.id);

    try {
      const result = await updateDoctor(doctor.id, scheduleData);
      console.log('API response received:', result);

      setLoading(false);

      if (result.success) {
        console.log('Update successful');
        Alert.alert('Éxito', 'Horario del doctor actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        console.log('Update failed with error:', result.error);
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.log('Exception during update:', error);
      setLoading(false);
      Alert.alert('Error', 'Error inesperado al actualizar el horario');
    }
  };

  const clearSchedule = () => {
    setFormData(prev => ({
      ...prev,
      start_time: '',
      end_time: ''
    }));
    setStartTimeDate(new Date());
    setEndTimeDate(new Date());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurar Horario de Trabajo</Text>
        <Text style={styles.subtitle}>Dr. {doctor.nombre}</Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>⏰ Horario Laboral</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora de Inicio (opcional)</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                {formData.start_time || '🕐 Seleccionar hora de inicio'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora de Fin (opcional)</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                {formData.end_time || '🕐 Seleccionar hora de fin'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>💡 Si no configura horario, el doctor podrá atender en cualquier momento</Text>
            <Text style={styles.infoText}>💡 Las citas se validarán contra este horario laboral</Text>
            <Text style={styles.infoText}>💡 Los horarios deben estar en formato 24 horas</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearSchedule}
          >
            <Text style={styles.clearButtonText}>🗑️ Limpiar Horario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? '⏳ Guardando...' : '✅ Guardar Horario'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Pickers */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTimeDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endTimeDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleEndTimeChange}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#2c3e50"
  },
  subtitle: {
    fontSize: 18,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25
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
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50"
  },
  timeButton: {
    borderWidth: 2,
    borderColor: "#bdc3c7",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#ecf0f1",
    alignItems: "center"
  },
  timeButtonText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center"
  },
  infoContainer: {
    backgroundColor: "#e8f4f8",
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },
  infoText: {
    fontSize: 14,
    color: "#2980b9",
    marginBottom: 5
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },
  clearButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#6c757d"
  },
  clearButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "bold"
  },
  saveButton: {
    backgroundColor: "#27ae60",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5
  },
  saveButtonDisabled: {
    backgroundColor: "#95a5a6",
    shadowOpacity: 0
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default AdminDoctorScheduleScreen;