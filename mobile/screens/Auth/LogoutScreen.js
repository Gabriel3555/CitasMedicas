import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../apis/authApi';

const LogoutScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sesión Cerrada</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default LogoutScreen;
