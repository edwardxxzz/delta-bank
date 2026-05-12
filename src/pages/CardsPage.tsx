import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CardItem {
  id: string;
  name: string;
  number: string;
  flag: string;
  type: string;
  limit: number;
  used: number;
  expirationDate: string;
  color: string;
  isVirtual: boolean;
}

const maskCardNumber = (number: string): string => {
  const last4 = number.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

export const CardsPage: React.FC = () => {
  const { userData } = useAuth();

  const mockCards: CardItem[] = [
    {
      id: '1',
      name: 'Cartão Platinum',
      number: '4532123456789012',
      flag: 'visa',
      type: 'credit',
      limit: 10000,
      used: 3240.9,
      expirationDate: '12/28',
      color: '#1A237E',
      isVirtual: false,
    },
    {
      id: '2',
      name: 'Cartão Gold',
      number: '5412345678901234',
      flag: 'mastercard',
      type: 'both',
      limit: 5000,
      used: 1200,
      expirationDate: '06/27',
      color: '#FF6B35',
      isVirtual: false,
    },
    {
      id: '3',
      name: 'Cartão Virtual',
      number: '4532987654321098',
      flag: 'visa',
      type: 'debit',
      limit: 0,
      used: 0,
      expirationDate: 'N/A',
      color: '#00C9A7',
      isVirtual: true,
    },
  ];

  const renderCard = ({ item }: { item: CardItem }) => (
    <LinearGradient
      colors={[item.color, `${item.color}CC`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.cardPattern}>
        <View style={[styles.cardTriangle, { right: -20, top: -20 }]} />
        <View style={[styles.cardTriangle, { left: 30, bottom: -25, transform: [{ rotate: '20deg' }] }]} />
      </View>

      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.name}</Text>
        {item.isVirtual && (
          <View style={styles.virtualBadge}>
            <Text style={styles.virtualText}>Virtual</Text>
          </View>
        )}
      </View>

      <View style={styles.cardChip}>
        <Text style={styles.chipIcon}>💳</Text>
      </View>

      <Text style={styles.cardNumber}>{maskCardNumber(item.number)}</Text>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Validade</Text>
          <Text style={styles.cardValue}>{item.expirationDate}</Text>
        </View>
        <Text style={styles.cardFlag}>
          {item.flag === 'visa' ? 'VISA' : item.flag === 'mastercard' ? 'MASTERCARD' : item.flag.toUpperCase()}
        </Text>
      </View>

      {item.type !== 'debit' && (
        <View style={styles.limitBar}>
          <View style={styles.limitTrack}>
            <View style={[styles.limitFill, { width: `${(item.used / item.limit) * 100}%` }]} />
          </View>
          <View style={styles.limitInfo}>
            <Text style={styles.limitText}>R$ {item.used.toLocaleString('pt-BR')} usados</Text>
            <Text style={styles.limitText}>R$ {item.limit.toLocaleString('pt-BR')} limite</Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Cartões</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={{ fontSize: 18 }}>➕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockCards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
      />

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <Text style={styles.actionLabel}>Bloquear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
          <Text style={styles.actionLabel}>Configurar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={{ fontSize: 20 }}>🔓</Text>
          <Text style={styles.actionLabel}>Desbloquear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.textPrimary },
  addButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0, 201, 167, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  list: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl },
  card: {
    borderRadius: BorderRadii.xl, padding: Spacing.xxl,
    overflow: 'hidden', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
    minHeight: 200, justifyContent: 'space-between',
  },
  cardPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06 },
  cardTriangle: {
    position: 'absolute', width: 100, height: 100,
    borderLeftWidth: 50, borderLeftColor: 'transparent',
    borderRightWidth: 50, borderRightColor: 'transparent',
    borderBottomWidth: 80, borderBottomColor: '#FFF',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.white },
  virtualBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadii.sm },
  virtualText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '600' },
  cardChip: { marginVertical: Spacing.lg },
  chipIcon: { fontSize: 28 },
  cardNumber: { fontSize: FontSizes.xxl, fontWeight: '500', color: Colors.white, letterSpacing: 2, marginBottom: Spacing.lg },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  cardValue: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '500' },
  cardFlag: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, letterSpacing: 1 },
  limitBar: { marginTop: Spacing.lg },
  limitTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  limitFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 2 },
  limitInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  limitText: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.7)' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  actionBtn: { alignItems: 'center', gap: Spacing.xs },
  actionLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
});
