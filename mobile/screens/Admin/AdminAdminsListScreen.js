import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { getUsers, deleteUser } from '../../apis/usersApi';

const AdminAdminsListScreen = ({ navigation }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const result = await getUsers();
    if (result.success) {
      // Filter only admin users
      const adminUsers = result.data.filter(user => user.role === 'admin');
      setAdmins(adminUsers);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleDeleteAdmin = async (id, name) => {
    Alert.alert(
      'Eliminar Administrador',
      `¿Estás seguro de que deseas eliminar al administrador ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteUser(id);
            if (result.success) {
              Alert.alert('Éxito', 'Administrador eliminado correctamente');
              fetchAdmins();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const renderAdmin = ({ item }) => (
    <View style={styles.adminItem}>
      <View style={styles.adminInfo}>
        <Text style={styles.adminName}>{item.name}</Text>
        <Text style={styles.adminDetails}>Email: {item.email}</Text>
        <Text style={styles.adminDetails}>Rol: {item.role}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AdminAdminUpdate', { admin: item })}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteAdmin(item.id, item.name)}
        >
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestionar Administradores</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminAdminCreate')}
        >
          <Text style={styles.addBtnText}>+ Agregar Admin</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <FlatList
          data={admins}
          renderItem={renderAdmin}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchAdmins}
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
  adminItem: {
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
  adminInfo: { flex: 1 },
  adminName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  adminDetails: { fontSize: 14, color: '#666' },
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

export default AdminAdminsListScreen;