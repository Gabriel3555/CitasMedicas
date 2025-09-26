import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPacientes, deletePaciente } from '../../apis/pacientesApi';

const AdminPacientesListScreen = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPacientes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPacientes();
    }, [])
  );

  const fetchPacientes = async () => {
    setLoading(true);
    const result = await getPacientes();
    if (result.success) {
      setPacientes(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleDeletePaciente = async (id, nombre) => {
    Alert.alert(
      'Eliminar Paciente',
      `¿Estás seguro de que deseas eliminar al paciente ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deletePaciente(id);
            if (result.success) {
              Alert.alert('Éxito', 'Paciente eliminado correctamente');
              fetchPacientes();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const renderPaciente = ({ item }) => (
    <View style={styles.pacienteItem}>
      <View style={styles.pacienteInfo}>
        <Text style={styles.pacienteName}>{item.nombre}</Text>
        <Text style={styles.pacienteDetails}>Email: {item.email}</Text>
        <Text style={styles.pacienteDetails}>Teléfono: {item.telefono}</Text>
        <Text style={styles.pacienteDetails}>EPS: {item.eps?.nombre}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AdminPacienteUpdate', { paciente: item })}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeletePaciente(item.id, item.nombre)}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestionar Pacientes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminPacienteCreate')}
        >
          <Text style={styles.addBtnText}>+ Agregar Paciente</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <FlatList
          data={pacientes}
          renderItem={renderPaciente}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchPacientes}
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
  pacienteItem: {
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
  pacienteInfo: { flex: 1 },
  pacienteName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  pacienteDetails: { fontSize: 14, color: '#666' },
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

export default AdminPacientesListScreen;