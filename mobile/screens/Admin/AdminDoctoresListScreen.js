import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { getDoctores, deleteDoctor } from '../../apis/doctoresApi';

const AdminDoctoresListScreen = ({ navigation }) => {
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctores();
  }, []);

  const fetchDoctores = async () => {
    setLoading(true);
    const result = await getDoctores();
    if (result.success) {
      setDoctores(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleDeleteDoctor = async (id, nombre) => {
    Alert.alert(
      'Eliminar Doctor',
      `¿Estás seguro de que deseas eliminar al doctor ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteDoctor(id);
            if (result.success) {
              Alert.alert('Éxito', 'Doctor eliminado correctamente');
              fetchDoctores();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const renderDoctor = ({ item }) => (
    <View style={styles.doctorItem}>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>Dr. {item.nombre}</Text>
        <Text style={styles.doctorDetails}>Especialidad: {item.especialidad?.nombre}</Text>
        <Text style={styles.doctorDetails}>EPS: {item.eps?.nombre}</Text>
        <Text style={styles.doctorDetails}>Email: {item.email}</Text>
        <Text style={styles.doctorDetails}>Teléfono: {item.telefono}</Text>
        <Text style={styles.doctorDetails}>
          Horario: {item.start_time} - {item.end_time}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={() => navigation.navigate('AdminDoctorSchedule', { doctor: item })}
        >
          <Text style={styles.btnText}>⏰ Horario</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AdminDoctorUpdate', { doctor: item })}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteDoctor(item.id, item.nombre)}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestionar Doctores</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminDoctorCreate')}
        >
          <Text style={styles.addBtnText}>+ Agregar Doctor</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <FlatList
          data={doctores}
          renderItem={renderDoctor}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchDoctores}
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
  doctorItem: {
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
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  doctorDetails: { fontSize: 14, color: '#666' },
  actions: { flexDirection: 'row', gap: 10 },
  scheduleBtn: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5
  },
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

export default AdminDoctoresListScreen;