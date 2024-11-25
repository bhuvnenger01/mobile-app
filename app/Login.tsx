import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const LoginSignupScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const toggleForm = () => {
    setIsLogin(!isLogin);
    Animated.timing(animatedValue, {
      toValue: isLogin ? 1 : 0,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://192.168.172.237:5000/login', {
        username,
        password,
      });
      const token = response.data.token;
      const tokenExpiration = Date.now() + 60 * 60 * 1000;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('tokenExpiration', tokenExpiration.toString());

      alert('Login Successful');
      router.replace('/(tabs)/ChatRoom');
    } catch (error) {
      alert('Error', 'Invalid credentials');
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://192.168.172.237:5000/signup', {
        username,
        password,
        email,
      });
      alert('Signup Successful');
      toggleForm(); // Switch to login form after successful signup
    } catch (error) {
      alert('Error', 'Signup failed');
    }
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden', // Set to 'hidden'
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden', // Set to 'hidden'
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Front Side - Login Form */}
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
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
          <TouchableOpacity onPress={toggleForm}>
            <Text style={styles.toggleText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Back Side - Signup Form */}
        <Animated.View style={[styles.card, backAnimatedStyle]}>
          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChange Text={setPassword} />
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleForm}>
            <Text style={styles.toggleText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </Animated.View>
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
  cardContainer: {
    width: 300,
    height: 400,
    perspective: '1000px', // Change perspective to a string with a unit
  },
  card: {
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
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

export default LoginSignupScreen;