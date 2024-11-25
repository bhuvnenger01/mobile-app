// components/ChatBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatBubbleProps {
  message: string;
  username: string;
  isOwnMessage: boolean; // true if it's the user's own message
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, username, isOwnMessage }) => {
  return (
    <View style={[styles.bubbleContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 20,
    maxWidth: '70%',
    marginLeft: 10,
    marginRight: 10,
  },
  ownMessage: {
    backgroundColor: '#0084ff',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#e4e6eb',
    alignSelf: 'flex-start',
  },
  username: {
    fontWeight: 'bold',
    color: '#555',
  },
  message: {
    color: '#333',
  },
});

export default ChatBubble;
