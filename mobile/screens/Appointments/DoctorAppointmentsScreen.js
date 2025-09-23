import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyCitasDoctor, updateCitaStatus } from '../../apis/citasApi';

const DoctorAppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const result = await getMyCitasDoctor();
      if (result.success) {
        // Filter out completed appointments and sort by date/time
        const filteredAppointments = result.data
          .filter(cita => cita.status !== 'completed' && cita.status !== 'cancelled')
          .sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            return dateA - dateB;
          });
        setAppointments(filteredAppointments);
      }
    };
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    const result = await updateCitaStatus(id, status);
    if (result.success) {
      Alert.alert('Éxito', `Cita ${status}`);
      // Refresh list
      setAppointments(appointments.map(app => app.id === id ? { ...app, status } : app));
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleCancelAppointment = async (id) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro de que deseas cancelar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => handleStatusUpdate(id, 'cancelled')
        }
      ]
    );
  };

  const renderAppointment = ({ item }) => {
    const isFutureAppointment = new Date(`${item.fecha}T${item.hora}`) > new Date();

    return (
      <View style={styles.appointmentItem}>
        <Text style={styles.patientName}>Paciente: {item.paciente?.nombre}</Text>
        <Text style={styles.appointmentInfo}>Fecha: {item.fecha} Hora: {item.hora}</Text>
        <Text style={styles.statusText}>Estado: {item.status}</Text>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleStatusUpdate(item.id, 'accepted')}>
              <Text style={styles.btnText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleStatusUpdate(item.id, 'rejected')}>
              <Text style={styles.btnText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'accepted' && isFutureAppointment && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelAppointment(item.id)}>
              <Text style={styles.btnText}>Cancelar Cita</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Citas</Text>
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  appointmentItem: { padding: 15, borderWidth: 1, borderColor: "#ccc", marginVertical: 5, borderRadius: 8, backgroundColor: "#f9f9f9" },
  patientName: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  appointmentInfo: { fontSize: 14, marginBottom: 5 },
  statusText: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  actions: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  acceptBtn: { backgroundColor: "#28a745", padding: 10, borderRadius: 5, minWidth: 80 },
  rejectBtn: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5, minWidth: 80 },
  cancelBtn: { backgroundColor: "#ffc107", padding: 10, borderRadius: 5, minWidth: 120 },
  btnText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default DoctorAppointmentsScreen;