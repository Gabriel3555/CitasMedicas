import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citas Médicas</Text>
      <Button title="Ver Citas" onPress={() => navigation.navigate("Citas")} />
      <Button
        title="Ver Doctores"
        onPress={() => navigation.navigate("Doctores")}
      />
      <Button
        title="Ver Pacientes"
        onPress={() => navigation.navigate("Pacientes")}
      />
      <Button title="Ver EPS" onPress={() => navigation.navigate("EPS")} />
      <Button
        title="Ver Especialidades"
        onPress={() => navigation.navigate("Especialidades")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
});
