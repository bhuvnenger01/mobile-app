import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from '@expo/vector-icons'; // Importing icons

export default function DashboardScreen() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = Platform.OS === "web" 
          ? localStorage.getItem("userToken") 
          : await SecureStore.getItemAsync("userToken");

        const response = await axios.get(
          "https://letchatit1-production.up.railway.app/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsername(response.data.username);
        setLoading(false); // Set loading to false after fetching data
      } catch (error) {
        Alert.alert("Error", "Session expired or invalid");
        handleLogout();
      }
    };

    fetchProtectedData();

    const interval = setInterval(fetchProtectedData, 60000); // Check session every 60 seconds

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        fetchProtectedData(); // Refresh user data
        return true; // Prevent default back action
      }
    );

    return () => {
      clearInterval(interval); // Cleanup interval
      backHandler.remove(); // Cleanup listener
    };
  }, [router]);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("userToken");
    } else {
      await SecureStore.deleteItemAsync("userToken");
    }
    router.replace("/Login");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.appname}>LetsChat.it</Text>
        <ActivityIndicator size="large" color="#2575fc" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.appname}>LetsChat.it</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]} // Changed gradient colors
        style={styles.background}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            Welcome, <Text style={styles.username}>{username}!</Text>
          </Text>
        </View>
      </LinearGradient>
      <View style={styles.widget}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/ChatRoom")}>
          <MaterialIcons name="chat" size={24} color="white" />
          <Text style={styles.buttonText}>Chat Room</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  background: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 5,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    alignItems: "center",
    marginVertical: 20,
  },
  header: {
    backgroundColor: "#6a11cb",
    padding: 40,
    elevation: 5,
    shadowColor: "#000",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appname: {
    fontSize: 30 ,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2575fc',
  },
  widget: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  button: {
    backgroundColor: "#2575fc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "80%",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "red",
    borderRadius: 5,
    padding: 10,
    
  },
});