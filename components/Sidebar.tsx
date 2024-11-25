// components/Sidebar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SidebarProps {
  onNavigate: (screen: string) => void; // Callback function to handle navigation
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  return (
    <View style={styles.sidebar}>
      <TouchableOpacity onPress={() => onNavigate('Dashboard')} style={styles.menuItem}>
        <Text style={styles.menuItemText}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('ChatRoom')} style={styles.menuItem}>
        <Text style={styles.menuItemText}>Chat Room</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate('Profile')} style={styles.menuItem}>
        <Text style={styles.menuItemText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  menuItem: {
    marginVertical: 10,
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Sidebar;
