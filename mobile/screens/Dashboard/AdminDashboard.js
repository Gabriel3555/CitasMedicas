import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../apis/authApi';

const AdminDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
    setLoading(true);
    const result = await logout();
    setLoading(false);
    if (result.success) {
      await AsyncStorage.removeItem('token');
      Alert.alert('Éxito', 'Sesión cerrada exitosamente');
      navigation.replace("Login");
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const adminMenuItems = [
    {
      section: 'Gestión de Usuarios',
      items: [
        { name: '👥 Gestionar Pacientes', screen: 'AdminPacientesList' },
        { name: '👨‍⚕️ Gestionar Doctores', screen: 'AdminDoctoresList' },
        { name: '👑 Gestionar Administradores', screen: 'AdminAdminsList' }
      ]
    },
    {
      section: 'Gestión del Sistema',
      items: [
        { name: '🏥 Gestionar EPS', screen: 'AdminEPSList' },
        { name: '🩺 Gestionar Especialidades', screen: 'AdminEspecialidadesList' },
        { name: '📅 Gestionar Citas', screen: 'AdminCitasList' }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigateTo("Profile")}
          >
            <Text style={styles.profileButtonText}>👤 Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.logoutButtonText}>
              {loading ? 'Cerrando...' : '🚪 Salir'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {adminMenuItems.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.menuItem}
              onPress={() => navigateTo(item.screen)}
            >
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  profileButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
    paddingBottom: 5
  },
  menuItem: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default AdminDashboard;