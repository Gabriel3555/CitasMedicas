import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CardComponent({ title, description, icon }) {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color="#1976D2" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "45%",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconContainer: { backgroundColor: "#E3F2FD", borderRadius: 50, padding: 12, marginBottom: 12 },
  textContainer: { alignItems: "center" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "#212121", textAlign: "center" },
  description: { fontSize: 14, color: "#757575", textAlign: "center" },
});
