import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../apis/authApi';

const DoctorDashboard = ({ navigation }) => {
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    const result = await logout();
    setLogoutLoading(false);
    if (result.success) {
      await AsyncStorage.removeItem('token');
      Alert.alert('Éxito', 'Sesión cerrada exitosamente');
      navigation.replace("Login");
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
        <Text style={styles.title}>Panel de Doctor</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.profileButtonText}>👤 Perfil</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DoctorAppointments')}>
          <Text style={styles.actionButtonText}>📋 Mis Citas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DoctorScheduleAppointment')}>
          <Text style={styles.actionButtonText}>📅 Agendar Cita</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('DoctorScheduleManagement')}>
          <Text style={styles.actionButtonText}>⏰ Gestionar Horario</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.logoutActionButton]} onPress={handleLogout} disabled={logoutLoading}>
          <Text style={styles.actionButtonText}>
            {logoutLoading ? 'Cerrando...' : '🚪 Cerrar Sesión'}
          </Text>
        </TouchableOpacity>
      </Animatable.View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 80,
    marginBottom: 15,
  },
  headerButtons: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  profileButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutActionButton: {
    backgroundColor: '#dc3545',
    shadowColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DoctorDashboard;