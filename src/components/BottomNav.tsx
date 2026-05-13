import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Spacing, FontSizes } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onCentralPress: () => void;
}

interface SideTab {
  id: string;
  label: string;
  icon: string;
  iconSet: 'Ionicons' | 'Feather' | 'MaterialCommunityIcons';
}

// 5 positions: Início, Cartões, [Triangle Center], Investir, Mais
const sideTabs: SideTab[] = [
  { id: 'home', label: 'Início', icon: 'home-outline', iconSet: 'Ionicons' },
  { id: 'cards', label: 'Cartões', icon: 'card-outline', iconSet: 'Ionicons' },
  { id: 'invest', label: 'Investir', icon: 'trending-up', iconSet: 'Feather' },
  { id: 'more', label: 'Mais', icon: 'more-horizontal', iconSet: 'Feather' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress, onCentralPress }) => {
  const { colors } = useTheme();

  const renderIcon = (tab: SideTab, isActive: boolean) => {
    const size = 22;
    const color = isActive ? colors.accent : colors.textMuted;
    if (tab.iconSet === 'Ionicons') return <Ionicons name={tab.icon as any} size={size} color={color} />;
    if (tab.iconSet === 'Feather') return <Feather name={tab.icon as any} size={size} color={color} />;
    if (tab.iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={tab.icon as any} size={size} color={color} />;
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bottomNavBg, borderTopColor: colors.bottomNavBorder }]}>
      {/* Início */}
      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('home')} activeOpacity={0.7}>
        {renderIcon(sideTabs[0], activeTab === 'home')}
        <Text style={[styles.tabLabel, { color: activeTab === 'home' ? colors.accent : colors.textMuted }]}>
          Início
        </Text>
      </TouchableOpacity>

      {/* Cartões */}
      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('cards')} activeOpacity={0.7}>
        {renderIcon(sideTabs[1], activeTab === 'cards')}
        <Text style={[styles.tabLabel, { color: activeTab === 'cards' ? colors.accent : colors.textMuted }]}>
          Cartões
        </Text>
      </TouchableOpacity>

      {/* Center Triangle Button */}
      <TouchableOpacity style={styles.centerTab} onPress={onCentralPress} activeOpacity={0.7}>
        <View style={[styles.centerCircle, { backgroundColor: colors.accent }]}>
          <View style={[styles.triangleIcon, { borderBottomColor: colors.white }]} />
        </View>
      </TouchableOpacity>

      {/* Investir */}
      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('invest')} activeOpacity={0.7}>
        {renderIcon(sideTabs[2], activeTab === 'invest')}
        <Text style={[styles.tabLabel, { color: activeTab === 'invest' ? colors.accent : colors.textMuted }]}>
          Investir
        </Text>
      </TouchableOpacity>

      {/* Mais */}
      <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('more')} activeOpacity={0.7}>
        {renderIcon(sideTabs[3], activeTab === 'more')}
        <Text style={[styles.tabLabel, { color: activeTab === 'more' ? colors.accent : colors.textMuted }]}>
          Mais
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Spacing.xl,
  },
  tabItem: {
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  centerTab: {
    alignItems: 'center',
    flex: 1,
    marginTop: -20,
  },
  centerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  triangleIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderLeftColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: 'transparent',
    borderBottomWidth: 20,
    marginTop: -4,
  },
});
