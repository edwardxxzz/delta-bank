import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';

interface BalanceCardProps {
  balance: number;
  monthlyChange: number;
  visible: boolean;
  onToggleVisibility: () => void;
  onViewStatement: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance, monthlyChange, visible, onToggleVisibility, onViewStatement,
}) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <LinearGradient
      colors={[Colors.cardGradientStart, Colors.cardGradientEnd]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.patternOverlay}>
        <View style={styles.triangle1} />
        <View style={styles.triangle2} />
      </View>

      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>Saldo em conta</Text>
        <TouchableOpacity onPress={onToggleVisibility} hitSlop={8}>
          <Text style={{ fontSize: 20 }}>{visible ? '👁' : '🙈'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.balanceAmount}>
        {visible ? formatCurrency(balance) : 'R$ ••••••'}
      </Text>

      <View style={styles.monthlyRow}>
        <Text style={{ fontSize: 14 }}>🔄</Text>
        <Text style={styles.monthlyText}>
          {monthlyChange >= 0 ? '+' : ''} {formatCurrency(monthlyChange)} este mês
        </Text>
      </View>

      <TouchableOpacity style={styles.statementButton} onPress={onViewStatement}>
        <Text style={{ fontSize: 16 }}>📄</Text>
        <Text style={styles.statementText}>Ver extrato</Text>
        <Text style={styles.statementArrow}>›</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: BorderRadii.xl, padding: Spacing.xxl, paddingTop: Spacing.xl, marginHorizontal: Spacing.xxl, marginVertical: Spacing.lg, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  patternOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06 },
  triangle1: { position: 'absolute', top: -20, right: -10, width: 120, height: 120, borderLeftWidth: 60, borderLeftColor: 'transparent', borderRightWidth: 60, borderRightColor: 'transparent', borderBottomWidth: 100, borderBottomColor: Colors.textWhite, transform: [{ rotate: '15deg' }] },
  triangle2: { position: 'absolute', bottom: -30, left: 20, width: 80, height: 80, borderLeftWidth: 40, borderLeftColor: 'transparent', borderRightWidth: 40, borderRightColor: 'transparent', borderBottomWidth: 70, borderBottomColor: Colors.textWhite, transform: [{ rotate: '-10deg' }] },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  balanceLabel: { color: Colors.textWhite, fontSize: FontSizes.lg, fontWeight: '400', opacity: 0.9 },
  balanceAmount: { color: Colors.textWhite, fontSize: FontSizes.balance, fontWeight: '700', marginBottom: Spacing.md, letterSpacing: -0.5 },
  monthlyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  monthlyText: { color: Colors.accent, fontSize: FontSizes.md, fontWeight: '500' },
  statementButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadii.md },
  statementText: { color: Colors.textWhite, fontSize: FontSizes.md, fontWeight: '500' },
  statementArrow: { color: Colors.textWhite, fontSize: 20, marginLeft: 'auto', fontWeight: '700' },
});
