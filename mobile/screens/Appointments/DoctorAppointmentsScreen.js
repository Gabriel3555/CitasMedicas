import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { getMyCitasDoctor, updateCitaStatus } from '../../apis/citasApi';

const DoctorAppointmentsScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    setLoading(true);
    const result = await getMyCitasDoctor();
    if (result.success) {
      setCitas(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (citaId, newStatus, statusLabel) => {
    Alert.alert(
      'Confirmar Cambio',
      `¿Estás seguro de cambiar el estado de esta cita a "${statusLabel}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const result = await updateCitaStatus(citaId, newStatus);
            if (result.success) {
              Alert.alert('Éxito', `Cita ${statusLabel.toLowerCase()} exitosamente`);
              fetchCitas(); // Refresh the list
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendiente_por_aprobador':
        return 'Pendiente por Aprobador';
      case 'aprobada':
        return 'Aprobada';
      case 'no_aprobado':
        return 'No Aprobado';
      case 'completada':
        return 'Completada';
      case 'no_asistio':
        return 'No Asistió';
      default:
        return status;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pendiente_por_aprobador':
        return styles.statusPending;
      case 'aprobada':
        return styles.statusApproved;
      case 'no_aprobado':
        return styles.statusRejected;
      case 'completada':
        return styles.statusCompleted;
      case 'no_asistio':
        return styles.statusNoAsistio;
      default:
        return styles.statusDefault;
    }
  };

  const renderActionButtons = (cita) => {
    const buttons = [];

    if (cita.status === 'pendiente_por_aprobador') {
      buttons.push(
        <TouchableOpacity
          key="accept"
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleStatusChange(cita.id, 'aprobada', 'Aprobada')}
        >
          <Text style={styles.actionButtonText}>✅ Aprobar</Text>
        </TouchableOpacity>
      );
      buttons.push(
        <TouchableOpacity
          key="reject"
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleStatusChange(cita.id, 'no_aprobado', 'Rechazada')}
        >
          <Text style={styles.actionButtonText}>❌ Rechazar</Text>
        </TouchableOpacity>
      );
    } else if (cita.status === 'aprobada') {
      buttons.push(
        <TouchableOpacity
          key="complete"
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleStatusChange(cita.id, 'completada', 'Completada')}
        >
          <Text style={styles.actionButtonText}>✅ Completar</Text>
        </TouchableOpacity>
      );
      buttons.push(
        <TouchableOpacity
          key="noAsistio"
          style={[styles.actionButton, styles.noAsistioButton]}
          onPress={() => handleStatusChange(cita.id, 'no_asistio', 'No Asistió')}
        >
          <Text style={styles.actionButtonText}>❌ No Asistió</Text>
        </TouchableOpacity>
      );
    }
    // Estados finales 'completada' y 'no_asistio' no muestran botones de cambio

    return buttons;
  };

  const renderCita = ({ item }) => (
    <View style={styles.citaItem}>
      <View style={styles.citaInfo}>
        <Text style={styles.citaPaciente}>
          Paciente: {typeof item.paciente === 'object' ? item.paciente?.nombre : item.paciente || 'Paciente'}
        </Text>
        <Text style={styles.citaFecha}>
          Fecha: {item.fecha} - Hora: {item.hora}
        </Text>
        <Text style={[styles.statusText, getStatusStyle(item.status)]}>
          Estado: {getStatusLabel(item.status)}
        </Text>
      </View>
      <View style={styles.actions}>
        {renderActionButtons(item)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Citas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      ) : (
        <FlatList
          data={citas}
          renderItem={renderCita}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchCitas}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes citas programadas</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: '#007AFF' },
  loading: { flex: 1, justifyContent: 'center' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 50 },
  citaItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  citaInfo: { marginBottom: 10 },
  citaPaciente: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  citaFecha: { fontSize: 14, marginBottom: 5, color: '#666' },
  statusText: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  statusPending: { color: '#ffc107' },
  statusApproved: { color: '#17a2b8' },
  statusRejected: { color: '#dc3545' },
  statusCompleted: { color: '#28a745' },
  statusNoAsistio: { color: '#6f42c1' },
  statusDefault: { color: '#6c757d' },
  actions: { flexDirection: 'column', gap: 6, alignItems: 'stretch' },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  acceptButton: { backgroundColor: '#28a745' },
  completeButton: { backgroundColor: '#17a2b8' },
  noAsistioButton: { backgroundColor: '#6f42c1' },
  rejectButton: { backgroundColor: '#dc3545' },
  actionButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});

export default DoctorAppointmentsScreen;