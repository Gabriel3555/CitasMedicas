import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ScrollView, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCitas, deleteCita, updateCitaStatus } from '../../apis/citasApi';

const AdminCitasListScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitas();
  }, []);

  // Refresh data when screen comes into focus (e.g., returning from create screen)
  useFocusEffect(
    React.useCallback(() => {
      fetchCitas();
    }, [])
  );

  // Citas sorted by ID (descending: 3, 2, 1)
  const sortedCitas = useMemo(() => {
    return [...citas].sort((a, b) => b.id - a.id);
  }, [citas]);


  const fetchCitas = async () => {
    setLoading(true);
    const result = await getCitas();
    if (result.success) {
      setCitas(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleDeleteCita = async (id, pacienteNombre, fecha, hora) => {
    Alert.alert(
      'Eliminar Cita',
      `¿Estás seguro de que deseas eliminar la cita de ${pacienteNombre} del ${fecha} a las ${hora}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCita(id);
            if (result.success) {
              Alert.alert('Éxito', 'Cita eliminada correctamente');
              fetchCitas();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente_por_aprobador':
        return '#ffc107'; // Yellow
      case 'aprobada':
        return '#28a745'; // Green
      case 'no_aprobado':
        return '#dc3545'; // Red
      case 'completada':
        return '#007bff'; // Blue
      case 'no_asistio':
        return '#6c757d'; // Gray
      default:
        return '#6c757d'; // Default gray
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente_por_aprobador':
        return 'Pendiente por Aprobador';
      case 'aprobada':
        return 'Aprobada';
      case 'no_aprobado':
        return 'No Aprobada';
      case 'completada':
        return 'Completada';
      case 'no_asistio':
        return 'No Asistió';
      default:
        return status || 'Sin Estado';
    }
  };

  const handleStatusChange = async (citaId, newStatus) => {
    Alert.alert(
      'Confirmar cambio de estado',
      `¿Cambiar el estado de la cita a "${getStatusText(newStatus)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const result = await updateCitaStatus(citaId, newStatus);
            if (result.success) {
              Alert.alert('Éxito', `Estado actualizado a: ${getStatusText(newStatus)}`);
              fetchCitas(); // Refresh the list
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const renderCita = ({ item }) => (
    <View style={styles.citaCard}>
      <View style={styles.citaHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>👤 {item.paciente?.nombre}</Text>
          <Text style={styles.patientDetails}>
            ID: {item.id} • {item.paciente?.eps?.nombre} • {item.paciente?.email}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.citaBody}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>👨‍⚕️ Dr. {item.doctor?.nombre}</Text>
          <Text style={styles.doctorSpecialty}>
            {item.doctor?.especialidad?.nombre} • {item.doctor?.eps?.nombre}
          </Text>
        </View>

        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentDate}>📅 {item.fecha}</Text>
          <Text style={styles.appointmentTime}>🕐 {item.hora}</Text>
        </View>
      </View>

      <View style={styles.citaActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            const statusOptions = [
              { label: 'Pendiente por Aprobador', value: 'pendiente_por_aprobador' },
              { label: 'Aprobada', value: 'aprobada' },
              { label: 'No Aprobada', value: 'no_aprobado' },
              { label: 'Completada', value: 'completada' },
              { label: 'No Asistió', value: 'no_asistio' },
            ];

            Alert.alert(
              'Cambiar Estado',
              'Selecciona el nuevo estado de la cita:',
              statusOptions.map(option => ({
                text: option.label,
                onPress: () => handleStatusChange(item.id, option.value),
                style: option.value === item.status ? 'default' : 'default'
              })).concat([{ text: 'Cancelar', style: 'cancel' }])
            );
          }}
        >
          <Text style={styles.actionBtnText}>📝 Estado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.editActionBtn]}
          onPress={() => navigation.navigate('AdminCitaUpdate', { cita: item })}
        >
          <Text style={styles.actionBtnText}>✏️ Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteActionBtn]}
          onPress={() => handleDeleteCita(item.id, item.paciente?.nombre, item.fecha, item.hora)}
        >
          <Text style={styles.actionBtnText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏥 Gestionar Citas</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AdminCitaCreate')}
          >
            <Text style={styles.addBtnText}>➕ Nueva Cita</Text>
          </TouchableOpacity>
        </View>



        {/* Appointments List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando citas...</Text>
          </View>
        ) : sortedCitas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 No se encontraron citas</Text>
            <Text style={styles.emptySubtext}>Intenta ajustar los filtros de búsqueda</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={sortedCitas}
              renderItem={renderCita}
              keyExtractor={item => item.id.toString()}
              refreshing={loading}
              onRefresh={fetchCitas}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  addBtn: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },


  // List
  listContainer: {
    padding: 20,
    paddingTop: 0
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d'
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center'
  },

  // Appointment Cards
  citaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  citaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  patientInfo: {
    flex: 1
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2
  },
  patientDetails: {
    fontSize: 12,
    color: '#6c757d'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center'
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold'
  },
  citaBody: {
    marginBottom: 12
  },
  doctorInfo: {
    marginBottom: 8
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#6c757d'
  },
  appointmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  appointmentDate: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500'
  },
  appointmentTime: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500'
  },
  citaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#ffc107',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2
  },
  editActionBtn: {
    backgroundColor: '#007bff'
  },
  deleteActionBtn: {
    backgroundColor: '#dc3545'
  },
  actionBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  }
});

export default AdminCitasListScreen;