import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onCentralPress: () => void;
}

const tabs = [
  { id: 'home', label: 'Início', icon: 'home-outline', iconSet: 'Ionicons' as const },
  { id: 'cards', label: 'Cartões', icon: 'card-outline', iconSet: 'Ionicons' as const },
  { id: 'invest', label: 'Investir', icon: 'trending-up', iconSet: 'Feather' as const },
  { id: 'more', label: 'Mais', icon: 'more-horizontal', iconSet: 'Feather' as const },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress, onCentralPress }) => {
  const renderIcon = (tab: typeof tabs[0], isActive: boolean) => {
    const size = 22;
    const color = isActive ? Colors.accent : Colors.textMuted;
    if (tab.iconSet === 'Ionicons') return <Ionicons name={tab.icon as any} size={size} color={color} />;
    if (tab.iconSet === 'Feather') return <Feather name={tab.icon as any} size={size} color={color} />;
    if (tab.iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={tab.icon as any} size={size} color={color} />;
    return null;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        // Center "Investir" tab gets the green accent button style
        if (tab.id === 'invest') {
          return (
            <TouchableOpacity key={tab.id} style={styles.investTab} onPress={() => onTabPress(tab.id)} activeOpacity={0.7}>
              <View style={styles.investCircle}>
                <Feather name="trending-up" size={22} color={Colors.white} />
              </View>
              <Text style={[styles.tabLabel, { color: isActive ? Colors.accent : Colors.textMuted }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={tab.id} style={styles.tabItem} onPress={() => onTabPress(tab.id)} activeOpacity={0.7}>
            {renderIcon(tab, isActive)}
            <Text style={[styles.tabLabel, { color: isActive ? Colors.accent : Colors.textMuted }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', backgroundColor: Colors.white,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.border,
    alignItems: 'center', justifyContent: 'space-around',
    paddingBottom: Spacing.xl,
  },
  tabItem: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  tabLabel: { fontSize: FontSizes.xs, fontWeight: '500' },
  investTab: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  investCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
    marginTop: -16, elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
});
