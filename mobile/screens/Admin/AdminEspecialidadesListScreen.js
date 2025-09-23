import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { getEspecialidades, deleteEspecialidad } from '../../apis/especialidadesApi';

const AdminEspecialidadesListScreen = ({ navigation }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    setLoading(true);
    const result = await getEspecialidades();
    if (result.success) {
      setEspecialidades(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleDeleteEspecialidad = async (id, nombre) => {
    Alert.alert(
      'Eliminar Especialidad',
      `¿Estás seguro de que deseas eliminar la especialidad "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteEspecialidad(id);
            if (result.success) {
              Alert.alert('Éxito', 'Especialidad eliminada correctamente');
              fetchEspecialidades();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const renderEspecialidad = ({ item }) => (
    <View style={styles.especialidadItem}>
      <View style={styles.especialidadInfo}>
        <Text style={styles.especialidadName}>{item.nombre}</Text>
        <Text style={styles.especialidadDetails}>ID: {item.id}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AdminEspecialidadUpdate', { especialidad: item })}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteEspecialidad(item.id, item.nombre)}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestionar Especialidades</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminEspecialidadCreate')}
        >
          <Text style={styles.addBtnText}>+ Agregar Especialidad</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <FlatList
          data={especialidades}
          renderItem={renderEspecialidad}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchEspecialidades}
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
  especialidadItem: {
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
  especialidadInfo: { flex: 1 },
  especialidadName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  especialidadDetails: { fontSize: 14, color: '#666' },
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

export default AdminEspecialidadesListScreen;