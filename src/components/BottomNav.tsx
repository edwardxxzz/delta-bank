import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onCentralPress: () => void;
}

const tabs = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'cards', label: 'Cartões', icon: '💳' },
  { id: 'central', label: '', icon: '' },
  { id: 'invest', label: 'Investir', icon: '📈' },
  { id: 'more', label: 'Mais', icon: '⚙️' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress, onCentralPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        if (tab.id === 'central') {
          return (
            <TouchableOpacity key={tab.id} style={styles.centralButton} onPress={onCentralPress} activeOpacity={0.7}>
              <View style={styles.centralInner}>
                <Text style={styles.centralLogo}>D</Text>
              </View>
            </TouchableOpacity>
          );
        }
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity key={tab.id} style={styles.tabItem} onPress={() => onTabPress(tab.id)} activeOpacity={0.7}>
            <Text style={[styles.tabIcon, { opacity: isActive ? 1 : 0.5 }]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, { color: isActive ? Colors.accent : Colors.textMuted }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: Colors.white, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center', justifyContent: 'space-around', paddingBottom: Spacing.xl },
  tabItem: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  centralButton: { alignItems: 'center', justifyContent: 'center', marginTop: -24 },
  centralInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  centralLogo: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '800', letterSpacing: -1 },
});
