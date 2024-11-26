import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        router.replace('/'); // Redirect if session is found
      }
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://letchatit1-production.up.railway.app/login', {
        username,
        password,
      });
      const token = response.data.token;
      const tokenExpiration = Date.now() + 60 * 60 * 1000;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('tokenExpiration', tokenExpiration.toString());

      Alert.alert('Login Successful');
      router.replace('/ChatRoom');
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Register')}>
          <Text style={styles.toggleText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  card: {
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderColor: '#007aff',
    width: '100%',
  },
  button: {
    backgroundColor: '#007aff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#007aff',
    marginTop: 10,
  },
});

export default LoginScreen;