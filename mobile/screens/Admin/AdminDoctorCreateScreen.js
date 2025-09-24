import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createDoctor } from '../../apis/doctoresApi';
import { getEspecialidades } from '../../apis/especialidadesApi';
import { getEps } from '../../apis/epsApi';

const AdminDoctorCreateScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad_id: '',
    eps_id: '',
    start_time: '',
    end_time: ''
  });
  const [especialidadesList, setEspecialidadesList] = useState([]);
  const [epsList, setEpsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTimeDate, setStartTimeDate] = useState(new Date());
  const [endTimeDate, setEndTimeDate] = useState(new Date());

  useEffect(() => {
    fetchEspecialidades();
    fetchEPS();
  }, []);

  const fetchEspecialidades = async () => {
    console.log('AdminDoctorCreateScreen - fetchEspecialidades called');
    const result = await getEspecialidades();
    console.log('AdminDoctorCreateScreen - getEspecialidades result:', result);
    if (result.success) {
      console.log('AdminDoctorCreateScreen - Setting especialidades list:', result.data);
      setEspecialidadesList(result.data);
    } else {
      console.error('AdminDoctorCreateScreen - Error fetching especialidades:', result.error);
    }
  };

  const fetchEPS = async () => {
    console.log('AdminDoctorCreateScreen - fetchEPS called');
    const result = await getEps();
    console.log('AdminDoctorCreateScreen - getEps result:', result);
    if (result.success) {
      console.log('AdminDoctorCreateScreen - Setting EPS list:', result.data);
      setEpsList(result.data);
    } else {
      console.error('AdminDoctorCreateScreen - Error fetching EPS:', result.error);
    }
  };

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

      // Si ya hay una hora de fin configurada, validar que no sea anterior
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

      // Validar que la hora de fin no sea anterior a la hora de inicio
      if (formData.start_time) {
        const startTime = new Date(`2000-01-01T${formData.start_time}:00`);
        const endTime = new Date(`2000-01-01T${timeString}:00`);

        if (endTime <= startTime) {
          Alert.alert(
            'Error',
            'La hora de fin debe ser posterior a la hora de inicio.',
            [{ text: 'OK' }]
          );
          return; // No actualizar si la validación falla
        }
      }

      setEndTimeDate(selectedDate);
      setFormData({ ...formData, end_time: timeString });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    console.log('AdminDoctorCreateScreen - handleSubmit called with formData:', formData);
    
    if (!formData.nombre || !formData.email || !formData.telefono ||
        !formData.especialidad_id || !formData.eps_id) {
      console.log('AdminDoctorCreateScreen - Validation failed, missing required fields:', {
        nombre: !!formData.nombre,
        email: !!formData.email,
        telefono: !!formData.telefono,
        especialidad_id: !!formData.especialidad_id,
        eps_id: !!formData.eps_id
      });
      Alert.alert('Error', 'Los campos marcados con * son obligatorios');
      return;
    }

    console.log('AdminDoctorCreateScreen - Validation passed, creating doctor with data:', formData);
    setLoading(true);
    const result = await createDoctor(formData);
    console.log('AdminDoctorCreateScreen - createDoctor result:', result);
    setLoading(false);

    if (result.success) {
      console.log('AdminDoctorCreateScreen - Doctor created successfully');
      Alert.alert('Éxito', 'Doctor creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      console.error('AdminDoctorCreateScreen - Error creating doctor:', result.error);
      Alert.alert('Error', result.error || 'Error desconocido al crear doctor');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Nuevo Doctor</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            placeholder="Ingrese el nombre completo"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
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
          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange('telefono', value)}
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Especialidad *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.especialidad_id}
              onValueChange={(value) => {
                console.log('AdminDoctorCreateScreen - Especialidad selected:', value);
                handleInputChange('especialidad_id', value);
              }}
              style={styles.picker}
            >
              <Picker.Item label="🔍 Seleccionar especialidad..." value="" />
              {(() => {
                console.log('AdminDoctorCreateScreen - Rendering especialidades:', especialidadesList);
                return especialidadesList.map((especialidad) => (
                  <Picker.Item
                    key={especialidad.id}
                    label={especialidad.nombre}
                    value={especialidad.id.toString()}
                  />
                ));
              })()}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>EPS *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.eps_id}
              onValueChange={(value) => {
                console.log('AdminDoctorCreateScreen - EPS selected:', value);
                handleInputChange('eps_id', value);
              }}
              style={styles.picker}
            >
              <Picker.Item label="🔍 Seleccionar EPS..." value="" />
              {(() => {
                console.log('AdminDoctorCreateScreen - Rendering EPS list:', epsList);
                console.log('AdminDoctorCreateScreen - EPS list length:', epsList.length);
                return epsList.map((eps) => {
                  console.log('AdminDoctorCreateScreen - Rendering EPS item:', eps);
                  return (
                    <Picker.Item
                      key={eps.id}
                      label={eps.nombre}
                      value={eps.id.toString()}
                    />
                  );
                });
              })()}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hora de inicio (opcional)</Text>
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
          <Text style={styles.label}>Hora de fin (opcional)</Text>
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
          <Text style={styles.infoText}>💡 Los campos marcados con * son obligatorios</Text>
          <Text style={styles.infoText}>💡 Primero debe crear especialidades y EPS para poder seleccionarlas</Text>
          <Text style={styles.infoText}>💡 Los horarios de inicio y fin son opcionales</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Creando...' : 'Crear Doctor'}
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
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  picker: { height: 50, color: "#2c3e50" },
  submitBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    backgroundColor: '#f8f9fa',
    alignItems: 'center'
  },
  timeButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center'
  },
  infoContainer: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  infoText: {
    fontSize: 14,
    color: '#2980b9',
    marginBottom: 5
  }
});

export default AdminDoctorCreateScreen;