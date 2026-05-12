import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

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

const mockCards: CardItem[] = [
  { id: '1', name: 'Delta Bank', number: '4532123456789012', flag: 'mastercard', type: 'debit', limit: 0, used: 0, expirationDate: '09/27', color: '#0A192F', isVirtual: false },
  { id: '2', name: 'Delta Bank', number: '5412345678901234', flag: 'visa', type: 'credit', limit: 10000, used: 3240.9, expirationDate: '12/28', color: '#0A192F', isVirtual: false },
  { id: '3', name: 'Delta Bank', number: '4532987654321098', flag: 'visa', type: 'debit', limit: 0, used: 0, expirationDate: 'N/A', color: '#0A192F', isVirtual: true },
];

export const CardsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'debito' | 'virtual' | 'credito'>('debito');
  const [showDetails, setShowDetails] = useState(false);

  const currentCard = mockCards.find(c => {
    if (selectedTab === 'debito') return c.type === 'debit' && !c.isVirtual;
    if (selectedTab === 'virtual') return c.isVirtual;
    return c.type === 'credit';
  }) || mockCards[0];

  const tabs: { key: typeof selectedTab; label: string }[] = [
    { key: 'debito', label: 'Débito' },
    { key: 'virtual', label: 'Virtual' },
    { key: 'credito', label: 'Crédito' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Cartões</Text>
        <TouchableOpacity style={styles.addButton}>
          <Feather name="plus" size={18} color={Colors.white} />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Card */}
        <LinearGradient
          colors={[Colors.cardGradientStart, Colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Frosted triangle decoration */}
          <View style={styles.cardTriangleFrost} />

          {/* Bank logo + name */}
          <View style={styles.cardTopRow}>
            <View style={styles.cardLogoRow}>
              <View style={styles.cardLogoTriangle} />
              <Text style={styles.cardBankName}>DELTA BANK</Text>
            </View>
            <Text style={styles.cardTypeLabel}>
              {currentCard.type === 'credit' ? 'Crédito' : 'Débito'}
            </Text>
          </View>

          {/* Chip */}
          <View style={styles.cardChipRow}>
            <MaterialCommunityIcons name="chip" size={36} color="#FFD54F" />
          </View>

          {/* Number */}
          <Text style={styles.cardNumber}>{maskCardNumber(currentCard.number)}</Text>

          {/* Bottom row */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>Validade</Text>
              <Text style={styles.cardValue}>{currentCard.expirationDate}</Text>
            </View>
            <Text style={styles.cardFlag}>
              {currentCard.flag === 'visa' ? 'VISA' : 'MASTERCARD'}
            </Text>
          </View>
        </LinearGradient>

        {/* Triangle Button - expand/collapse details */}
        <TouchableOpacity
          style={styles.triangleButtonContainer}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}
        >
          <View style={styles.triangleButton}>
            <Ionicons
              name={showDetails ? 'chevron-up' : 'chevron-up'}
              size={20}
              color={Colors.white}
            />
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.bloquearBtn}>
            <Feather name="lock" size={18} color={Colors.negative} />
            <Text style={styles.bloquearText}>Bloquear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.faturaBtn}>
            <Feather name="file-text" size={18} color={Colors.textSecondary} />
            <Text style={styles.faturaText}>Ver fatura</Text>
          </TouchableOpacity>
        </View>

        {/* Details Table */}
        {showDetails && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo</Text>
              <Text style={styles.detailValue}>
                {currentCard.type === 'credit' ? 'Crédito' : 'Débito'}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bandeira</Text>
              <Text style={styles.detailValue}>
                {currentCard.flag === 'visa' ? 'Visa' : 'Mastercard'}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Limite total</Text>
              <Text style={styles.detailValue}>
                {currentCard.limit > 0 ? `R$ ${currentCard.limit.toLocaleString('pt-BR')}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Limite disponível</Text>
              <Text style={styles.detailValue}>
                {currentCard.limit > 0 ? `R$ ${(currentCard.limit - currentCard.used).toLocaleString('pt-BR')}` : 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.accent, borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  addButtonText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '600' },
  // Tabs
  tabsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadii.md, backgroundColor: Colors.surfaceLight,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { fontSize: FontSizes.md, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.white, fontWeight: '600' },
  // Scroll
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
  // Card
  card: {
    borderRadius: BorderRadii.xl, padding: Spacing.xxl, overflow: 'hidden',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, minHeight: 200,
    justifyContent: 'space-between',
  },
  cardTriangleFrost: {
    position: 'absolute', top: -20, left: -20,
    width: 0, height: 0,
    borderLeftWidth: 60, borderLeftColor: 'transparent',
    borderRightWidth: 60, borderRightColor: 'transparent',
    borderBottomWidth: 100, borderBottomColor: Colors.accent,
    opacity: 0.15,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLogoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardLogoTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderLeftColor: 'transparent',
    borderRightWidth: 10, borderRightColor: 'transparent',
    borderBottomWidth: 16, borderBottomColor: Colors.accent,
  },
  cardBankName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, letterSpacing: 1 },
  cardTypeLabel: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.7)', fontWeight: '400' },
  cardChipRow: { marginVertical: Spacing.lg },
  cardNumber: {
    fontSize: FontSizes.xxl, fontWeight: '500', color: Colors.white,
    letterSpacing: 3, marginBottom: Spacing.lg,
  },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  cardValue: { fontSize: FontSizes.md, color: Colors.white, fontWeight: '500' },
  cardFlag: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, letterSpacing: 1 },
  // Triangle Button
  triangleButtonContainer: {
    alignItems: 'center', marginTop: -16, zIndex: 10,
  },
  triangleButton: {
    width: 36, height: 36,
    borderTopWidth: 0, borderLeftWidth: 18, borderRightWidth: 18,
    borderBottomWidth: 28,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  // Action Buttons
  actionsRow: {
    flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xxl,
  },
  bloquearBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: '#FEF2F2', borderRadius: BorderRadii.lg,
    paddingVertical: Spacing.lg,
  },
  bloquearText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.negative },
  faturaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.white, borderRadius: BorderRadii.lg,
    paddingVertical: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  faturaText: { fontSize: FontSizes.md, fontWeight: '500', color: Colors.textSecondary },
  // Details
  detailsCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadii.lg,
    padding: Spacing.lg, marginTop: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  detailLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  detailValue: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  detailDivider: { height: 1, backgroundColor: Colors.border },
});
