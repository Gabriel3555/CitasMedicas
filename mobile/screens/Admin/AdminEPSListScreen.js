import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEps, deleteEps } from '../../apis/epsApi';

const AdminEPSListScreen = ({ navigation }) => {
  const [epsList, setEpsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEPS();
  }, []);

  // Refresh data when screen comes into focus (e.g., returning from create screen)
  useFocusEffect(
    React.useCallback(() => {
      fetchEPS();
    }, [])
  );

  const fetchEPS = async () => {
    setLoading(true);
    const result = await getEps();
    if (result.success) {
      setEpsList(result.data);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleDeleteEPS = async (id, nombre) => {
    Alert.alert(
      'Eliminar EPS',
      `¿Estás seguro de que deseas eliminar la EPS "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteEps(id);
            if (result.success) {
              Alert.alert('Éxito', 'EPS eliminada correctamente');
              fetchEPS();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const renderEPS = ({ item }) => (
    <View style={styles.epsItem}>
      <View style={styles.epsInfo}>
        <Text style={styles.epsName}>{item.nombre}</Text>
        <Text style={styles.epsDetails}>ID: {item.id}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AdminEPSUpdate', { eps: item })}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteEPS(item.id, item.nombre)}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestionar EPS</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminEPSCreate')}
        >
          <Text style={styles.addBtnText}>+ Agregar EPS</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <FlatList
          data={epsList}
          renderItem={renderEPS}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchEPS}
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
  epsItem: {
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
  epsInfo: { flex: 1 },
  epsName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  epsDetails: { fontSize: 14, color: '#666' },
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

export default AdminEPSListScreen;