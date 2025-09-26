import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { me } from '../../apis/authApi';

const CitaDetalleScreen = ({ route, navigation }) => {
  const { cita } = route.params;
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getUserRole = async () => {
      const result = await me();
      if (result.success) {
        setUserRole(result.data.role);
      }
    };
    getUserRole();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userRole === 'paciente' ? 'Detalle de Mi Cita' : 'Detalle Cita'}
      </Text>
      <Text style={styles.text}>ID: {cita.id}</Text>
      <Text style={styles.text}>Paciente: {typeof cita.paciente === 'object' ? cita.paciente?.nombre : cita.paciente}</Text>
      <Text style={styles.text}>Doctor: {typeof cita.doctor === 'object' ? `Dr. ${cita.doctor?.nombre}` : cita.doctor}</Text>
      <Text style={styles.text}>Fecha: {cita.fecha}</Text>
      <Text style={styles.text}>Hora: {cita.hora}</Text>
      <Text style={styles.text}>Estado: {cita.status || cita.estado}</Text>

      {userRole === 'admin' && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("AdminCitaUpdate", { cita })}
          >
            <Text style={styles.buttonText}>✏️ Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "red" }]}
            onPress={() => navigation.navigate("CitaDelete", { cita })}
          >
            <Text style={styles.buttonText}>🗑 Eliminar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  text: { fontSize: 18, marginBottom: 10 },
  button: { marginTop: 10, backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default CitaDetalleScreen;
