import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text } from "react-native";
import CardComponent from "../components/CardComponent";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bienvenido a la App</Text>
      <View style={styles.cardContainer}>
        <CardComponent title="Asociados" description="Gestionar asociados" icon="person-circle-outline" />
        <CardComponent title="Actividades" description="Agregar nuevas actividades" icon="settings-outline" />
        <CardComponent title="Prestamos" description="Ver prestamos" icon="notifications-outline" />
        <CardComponent title="Pagos" description="Registrar pagos" icon="help-circle-outline" />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", alignItems: "center", justifyContent: "center", paddingTop: 50 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#212121" },
  cardContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", width: "90%" },
});
