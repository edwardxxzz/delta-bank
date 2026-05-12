import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';

interface QuickActionsProps {
  onPix: () => void;
  onPay: () => void;
  onTransfer: () => void;
  onLoan: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onPix, onPay, onTransfer, onLoan }) => {
  const actions = [
    { label: 'Pix', icon: '💎', bgColor: 'rgba(0, 201, 167, 0.1)', onPress: onPix },
    { label: 'Pagar', icon: '📊', bgColor: 'rgba(26, 35, 126, 0.1)', onPress: onPay },
    { label: 'Transferir', icon: '↔️', bgColor: 'rgba(57, 73, 171, 0.1)', onPress: onTransfer },
    { label: 'Empréstimos', icon: '💰', bgColor: 'rgba(255, 107, 53, 0.1)', onPress: onLoan },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {actions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionItem} onPress={action.onPress} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
              <Text style={{ fontSize: 24 }}>{action.icon}</Text>
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
  iconContainer: { width: 56, height: 56, borderRadius: BorderRadii.lg, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '500' },
});
