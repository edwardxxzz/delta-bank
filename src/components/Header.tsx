import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface HeaderProps {
  name: string;
  onProfilePress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ name, onProfilePress }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Olá, {name}</Text>
        <Text style={styles.subtitle}>Que bom te ver por aqui!</Text>
      </View>
      <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
        <Ionicons name="person" size={20} color={Colors.primary} />
        <View style={styles.onlineDot} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  greeting: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.lg, color: Colors.textSecondary, marginTop: 2 },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(26, 35, 126, 0.08)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  onlineDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent, borderWidth: 2, borderColor: Colors.white },
});
