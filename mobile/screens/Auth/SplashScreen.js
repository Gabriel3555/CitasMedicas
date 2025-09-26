import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { me } from '../../apis/authApi';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const result = await me();
        if (result.success) {
          const userRole = result.data.role;
          if (userRole === 'admin') {
            navigation.replace('AdminDashboard');
          } else if (userRole === 'doctor') {
            navigation.replace('DoctorDashboard');
          } else if (userRole === 'paciente') {
            navigation.replace('PacienteDashboard');
          } else {
            navigation.replace('Login');
          }
        } else {
          navigation.replace('Login');
        }
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" duration={1000} style={styles.headerContainer}>
        <Text style={styles.title}>🏥 Citas Médicas</Text>
        <Text style={styles.subtitle}>Sistema de Gestión</Text>
      </Animatable.View>

      <Animatable.View animation="bounceIn" duration={1500} style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.loadingText}>
          Cargando...
        </Animatable.Text>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 16,
    fontWeight: '600',
  },
});

export default SplashScreen;