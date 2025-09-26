import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getCitas, getMyCitas } from '../../apis/citasApi';
import { me } from '../../apis/authApi';

const CitasListScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchUserAndCitas();
  }, []);

  const fetchUserAndCitas = async () => {
    try {
      // Get user info to determine role
      const userResult = await me();
      if (userResult.success) {
        setUserRole(userResult.data.role);
      }

      // Fetch citas based on role
      const citasResult = userResult.data?.role === 'paciente' ? await getMyCitas() : await getCitas();

      if (citasResult.success) {
        setCitas(citasResult.data);
      } else {
        Alert.alert('Error', citasResult.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendiente_por_aprobador':
        return 'Pendiente por Aprobador';
      case 'aprobada':
        return 'Aprobada';
      case 'no_aprobado':
        return 'No Aprobado';
      case 'completada':
        return 'Completada';
      case 'no_asistio':
        return 'No Asistió';
      default:
        return status;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pendiente_por_aprobador':
        return styles.statusPending;
      case 'aprobada':
        return styles.statusApproved;
      case 'no_aprobado':
        return styles.statusRejected;
      case 'completada':
        return styles.statusCompleted;
      case 'no_asistio':
        return styles.statusNoAsistio;
      default:
        return styles.statusDefault;
    }
  };

  const getPacienteName = (paciente) => {
    if (typeof paciente === 'object' && paciente?.nombre) {
      return paciente.nombre;
    }
    return typeof paciente === 'string' ? paciente : 'Paciente';
  };

  const getDoctorName = (doctor) => {
    if (typeof doctor === 'object' && doctor?.nombre) {
      return doctor.nombre;
    }
    return typeof doctor === 'string' ? doctor : 'Doctor';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userRole === 'paciente' ? 'Mis Citas' : 'Listado de Citas'}
      </Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate("CitaDetalle", { cita: item })}
            >
              <Text style={styles.text}>
                {item.fecha} {item.hora} - {userRole === 'paciente' ?
                  `Cita con Dr. ${getDoctorName(item.doctor)}` :
                  `${getPacienteName(item.paciente)} con Dr. ${getDoctorName(item.doctor)}`
                }
              </Text>
              {item.status && (
                <Text style={[styles.statusText, getStatusStyle(item.status)]}>
                  Estado: {getStatusLabel(item.status)}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CitaCreate")}
        >
          <Text style={styles.buttonText}>➕ Crear Cita</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: "#ccc" },
  text: { fontSize: 16 },
  statusText: { fontSize: 14, marginTop: 5, fontWeight: 'bold' },
  statusPending: { color: '#ffc107' },
  statusApproved: { color: '#17a2b8' },
  statusRejected: { color: '#dc3545' },
  statusCompleted: { color: '#28a745' },
  statusNoAsistio: { color: '#6f42c1' },
  statusDefault: { color: '#6c757d' },
  button: { marginTop: 20, backgroundColor: "#007AFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});

export default CitasListScreen;
