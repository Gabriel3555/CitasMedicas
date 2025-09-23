import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { getCitas, deleteCita } from '../../apis/citasApi';

const AdminCitasListScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitas();
  }, []);

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
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const renderCita = ({ item }) => (
    <View style={styles.citaItem}>
      <View style={styles.citaInfo}>
        <Text style={styles.citaPaciente}>Paciente: {item.paciente?.nombre}</Text>
        <Text style={styles.citaDoctor}>Doctor: Dr. {item.doctor?.nombre}</Text>
        <Text style={styles.citaFecha}>Fecha: {item.fecha} - Hora: {item.hora}</Text>
        <Text style={[styles.citaStatus, { backgroundColor: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AdminCitaUpdate', { cita: item })}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteCita(item.id, item.paciente?.nombre, item.fecha, item.hora)}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestionar Citas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminCitaCreate')}
        >
          <Text style={styles.addBtnText}>+ Agregar Cita</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <FlatList
          data={citas}
          renderItem={renderCita}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchCitas}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  addBtn: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5
  },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  loadingText: { textAlign: 'center', fontSize: 16, marginTop: 50 },
  citaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f9f9f9'
  },
  citaInfo: { flex: 1 },
  citaPaciente: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
  citaDoctor: { fontSize: 14, marginBottom: 3 },
  citaFecha: { fontSize: 14, marginBottom: 5 },
  citaStatus: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 12,
    alignSelf: 'flex-start'
  },
  actions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5
  },
  btnText: { color: 'white', fontSize: 12 }
});

export default AdminCitasListScreen;