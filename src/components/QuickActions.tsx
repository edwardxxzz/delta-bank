import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface QuickActionsProps {
  onPix: () => void;
  onPay: () => void;
  onTransfer: () => void;
  onLoan: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onPix, onPay, onTransfer, onLoan }) => {
  const actions = [
    { label: 'Pix', icon: 'diamond', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.pixBg, iconColor: Colors.pixIcon, onPress: onPix },
    { label: 'Pagar', icon: 'barchart', iconSet: 'Ionicons' as const, bgColor: Colors.pagarBg, iconColor: Colors.pagarIcon, onPress: onPay },
    { label: 'Transferir', icon: 'swap-horizontal', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.transferirBg, iconColor: Colors.transferirIcon, onPress: onTransfer },
    { label: 'Empréstimos', icon: 'cash', iconSet: 'MaterialCommunityIcons' as const, bgColor: Colors.emprestimoBg, iconColor: Colors.emprestimoIcon, onPress: onLoan },
  ];

  const renderIcon = (action: typeof actions[0]) => {
    const size = 26;
    if (action.iconSet === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={action.icon as any} size={size} color={action.iconColor} />;
    }
    return <Ionicons name={action.icon as any} size={size} color={action.iconColor} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {actions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionItem} onPress={action.onPress} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
              {renderIcon(action)}
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionItem: { alignItems: 'center', gap: Spacing.sm },
  iconContainer: { width: 56, height: 56, borderRadius: BorderRadii.md, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '500' },
});
