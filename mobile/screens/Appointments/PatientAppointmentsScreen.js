import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { getMyCitas } from '../../apis/citasApi';

const PatientAppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const result = await getMyCitas();
      if (result.success) {
        setAppointments(result.data);
      }
    };
    fetchAppointments();
  }, []);

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentItem}>
      <Text>Doctor: {item.doctor?.nombre}</Text>
      <Text>Especialidad: {item.doctor?.especialidad?.nombre}</Text>
      <Text>Fecha: {item.fecha} Hora: {item.hora}</Text>
      <Text>Status: {item.status}</Text>
    </View>
  );

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
  appointmentItem: { padding: 15, borderWidth: 1, borderColor: "#ccc", marginVertical: 5, borderRadius: 8 },
});

export default PatientAppointmentsScreen;