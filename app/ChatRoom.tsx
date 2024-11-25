import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';

const socket = io("http://192.168.172.237:5000"); // Your Flask backend URL

const ChatRoom = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [username, setUsername] = useState<string | undefined>();
  const [room, setRoom] = useState<string>('General'); // Default room
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null); // Track session expiry time

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Platform.OS === 'web' 
          ? localStorage.getItem('userToken') 
          : await SecureStore.getItemAsync('userToken');

        const response = await axios.get('http://192.168.172.237:5000/protected', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(response.data.username);
      } catch (error) {
        Alert.alert('Error', 'Session expired or invalid');
        router.push('/Login');
      }
    };

    checkAuth();

    // Join room
    socket.emit('join', { username, room });

    // Listen for messages
    socket.on('message', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    // Set interval to check for session expiration
    const interval = setInterval(() => {
      if (sessionExpiresAt && Date.now() > sessionExpiresAt - 5 * 60 * 1000) {
        showSessionExpiryPopup();
      }
    }, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      socket.off();
      clearInterval(interval);
    };
  }, [username, sessionExpiresAt]);

  const showSessionExpiryPopup = () => {
    Alert.alert(
      'Session Expiring Soon',
      'Your session will expire soon. Would you like to continue your session?',
      [
        { text: 'Yes', onPress: refreshSession },
        { text: 'No', onPress: handleLogout },
      ]
    );
  };

  const refreshSession = async () => {
    try {
      let token = Platform.OS === 'web' 
        ? localStorage.getItem('userToken') 
        : await SecureStore.getItemAsync('userToken');

      const response = await axios.post('http://192.168.172.237:5000/refresh', { token });
      const newToken = response.data.token;
      const newExpirationTime = Date.now() + 60 * 60 * 1000; // Assume new token expires in 1 hour

      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', newToken);
        localStorage.setItem('tokenExpiration', newExpirationTime.toString());
      } else {
        await SecureStore.setItemAsync('userToken', newToken);
        await SecureStore.setItemAsync('tokenExpiration', newExpirationTime.toString());
      }

      setSessionExpiresAt(newExpirationTime);
      Alert.alert('Session Extended', 'Your session has been extended.');
    } catch (error) {
      console.error('Error refreshing session:', error);
      handleLogout();
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('tokenExpiration');
    } else {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('tokenExpiration');
    }
    router.push('/');
  };

  const sendMessage = () => {
    if (message) {
      socket.emit('message', { username, room, message });
      setMessage(''); // Clear the message input after sending
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome {username}!</Text>
      <Text style={styles.roomText}>Room: {room}</Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roomText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  messageList: {
    flex: 1,
    marginBottom: 10,
  },
  messageBubble: {
    backgroundColor: '#007aff',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#007aff',
    borderRadius: 5,
    padding: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatRoom;