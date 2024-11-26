import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';

const socket = io("https://letchatit1-production.up.railway.app/"); // Your Flask backend URL

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

        const response = await axios.get('https://letchatit1-production.up.railway.app//protected', {
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

      const response = await axios.post('https://letchatit1-production.up.railway.app//refresh', { token });
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

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`https://letchatit1-production.up.railway.app/messages`, {
        headers: { Authorization: `Bearer ${Platform.OS==='web'?localStorage.getItem('userToken'): await SecureStore.getItemAsync('userToken')}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome {username}!</Text>
      <Text style={styles.roomText}>Room: {room}</Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.messageText}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        style={styles.input}
        placeholder="Type your message..."
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={sendMessage}
      />
      <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 10,
  },
  roomText: {
    fontSize: 16,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 16,
    marginVertical: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatRoom;