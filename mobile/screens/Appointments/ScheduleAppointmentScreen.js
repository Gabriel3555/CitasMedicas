import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, TextInput } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { getDoctores } from '../../apis/doctoresApi';
import { getEspecialidades } from '../../apis/especialidadesApi';
import { createCita } from '../../apis/citasApi';
import DateTimePicker from '@react-native-community/datetimepicker';

const ScheduleAppointmentScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const specialtiesResult = await getEspecialidades();
      if (specialtiesResult.success) {
        setSpecialties(specialtiesResult.data);
      }

      await fetchDoctors();
    };
    fetchData();
  }, []);


  const fetchDoctors = async (especialidadId = null) => {
    const result = await getDoctores(especialidadId);
    if (result.success) {
      const availableDoctors = result.data.filter(doctor =>
        doctor.start_time && doctor.end_time
      );
      setDoctors(availableDoctors);
      if (selectedDoctor && !availableDoctors.find(d => d.id === selectedDoctor.id)) {
        setSelectedDoctor(null);
      }
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (selectedDate.toDateString() === new Date().toDateString()) {
        Alert.alert('Error', 'No puedes agendar citas el día presente, solo el siguiente al presente');
        return;
      }
      setSelectedDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  const handleSchedule = async () => {
    console.log('Iniciando handleSchedule');
    console.log('selectedDoctor:', selectedDoctor);
    console.log('selectedDate:', selectedDate);
    console.log('selectedTime:', selectedTime);

    if (!selectedDoctor) {
      Alert.alert('Error', 'Selecciona un doctor');
      return;
    }

    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      Alert.alert('Error', 'Las citas solo se pueden agendar de lunes a viernes');
      return;
    }

    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`; // Agregar segundos

    console.log('timeString generado:', timeString);

    const startTime = selectedDoctor.start_time;
    const endTime = selectedDoctor.end_time;

    console.log('Horario doctor:', { startTime, endTime });

    if (timeString < startTime || timeString >= endTime) {
      Alert.alert('Error', `Las citas deben ser entre ${startTime} y ${endTime}`);
      return;
    }

    const citaData = {
      doctor_id: selectedDoctor.id,
      fecha: selectedDate.toISOString().split('T')[0],
      hora: timeString,
    };

    console.log('Datos de cita a enviar:', citaData);

    const result = await createCita(citaData);
    console.log('Resultado de createCita:', result);

    if (result.success) {
      Alert.alert('Éxito', 'Cita agendada exitosamente');
      navigation.goBack();
    } else {
      console.log('Error en createCita:', result.error);
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

        <Text style={styles.label}>Selecciona una Especialidad:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSpecialty?.id || ''}
            onValueChange={(itemValue) => {
              const specialty = specialties.find(s => s.id === itemValue);
              setSelectedSpecialty(specialty);
              fetchDoctors(itemValue || null);
            }}
            style={styles.picker}
            color="#000"
          >
            <Picker.Item label="Todas las especialidades..." value="" />
            {specialties.map(specialty => (
              <Picker.Item
                key={specialty.id}
                label={specialty.nombre}
                value={specialty.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Selecciona un Doctor:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDoctor?.id || ''}
            onValueChange={(itemValue) => {
              const doctor = doctors.find(d => d.id === itemValue);
              setSelectedDoctor(doctor);
            }}
            style={styles.picker}
            color="#000"
          >
            <Picker.Item label="Selecciona un doctor..." value="" />
            {doctors.map(doctor => (
              <Picker.Item
                key={doctor.id}
                label={`${doctor.nombre} - ${typeof doctor.especialidad === 'object' ? doctor.especialidad?.nombre || 'Sin especialidad' : doctor.especialidad || 'Sin especialidad'}`}
                value={doctor.id}
              />
            ))}
          </Picker>
        </View>
        {selectedDoctor && (
          <Text style={styles.scheduleInfo}>
            Horario: {selectedDoctor.start_time} - {selectedDoctor.end_time}
          </Text>
        )}

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


        <TouchableOpacity style={styles.button} onPress={handleSchedule}>
          <Text style={styles.buttonText}>Agendar</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
            minuteInterval={15}
          />
        )}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: "#f8f9fa"
  },
  picker: { height: 50, width: '100%', color: '#000' },
  scheduleInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
    fontStyle: "italic"
  },
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

export default ScheduleAppointmentScreen;