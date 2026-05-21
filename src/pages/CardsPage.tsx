import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
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
  isBlocked: boolean;
}

const maskCardNumber = (number: string): string => {
  const last4 = number.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

const mockCards: CardItem[] = [
  { id: '1', name: 'Delta Bank', number: '4532123456789012', flag: 'mastercard', type: 'debit', limit: 0, used: 0, expirationDate: '09/27', color: '#0A192F', isVirtual: false, isBlocked: false },
  { id: '2', name: 'Delta Bank', number: '5412345678901234', flag: 'visa', type: 'credit', limit: 10000, used: 3240.90, expirationDate: '12/28', color: '#0A192F', isVirtual: false, isBlocked: false },
  { id: '3', name: 'Delta Bank', number: '4532987654321098', flag: 'visa', type: 'debit', limit: 0, used: 0, expirationDate: 'N/A', color: '#0A192F', isVirtual: true, isBlocked: false },
];

const hiddenCardNumber = '•••• •••• •••• ••••';

const formatCardNumber = (number: string): string =>
  number.replace(/(\d{4})(?=\d)/g, '$1 ');

const hashSeed = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const luhnCheckDigit = (digits: string): number => {
  const sum = digits
    .split('')
    .reverse()
    .reduce((total, digit, index) => {
      let value = Number(digit);
      if (index % 2 === 0) {
        value *= 2;
        if (value > 9) value -= 9;
      }
      return total + value;
    }, 0);
  return (10 - (sum % 10)) % 10;
};

const generateCardNumber = (seed: string, prefix: string): string => {
  let state = hashSeed(seed);
  let body = prefix;
  while (body.length < 15) {
    state = (state * 1664525 + 1013904223) >>> 0;
    body += String(state % 10);
  }
  return `${body}${luhnCheckDigit(body)}`;
};

interface CardsPageProps {
  navigation?: any;
}

export const CardsPage: React.FC<CardsPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'debito' | 'virtual' | 'credito'>('debito');
  const [showDetails, setShowDetails] = useState(false);
  const [cardNumberVisible, setCardNumberVisible] = useState(false);
  const [blockedCards, setBlockedCards] = useState<Record<string, boolean>>({});
  const cards = useMemo(
    () =>
      mockCards.map((card, index) => ({
        ...card,
        number: generateCardNumber(
          `${userData?.cpf || 'delta'}-${index}-${card.type}-${card.isVirtual ? 'virtual' : 'physical'}`,
          card.flag === 'visa' ? '4' : '5'
        ),
      })),
    [userData?.cpf]
  );

  const currentCard = cards.find(c => {
    if (selectedTab === 'debito') return c.type === 'debit' && !c.isVirtual;
    if (selectedTab === 'virtual') return c.isVirtual;
    return c.type === 'credit';
  }) || cards[0];

  const toggleBlock = () => {
    setBlockedCards(prev => ({ ...prev, [currentCard.id]: !(prev[currentCard.id] ?? currentCard.isBlocked) }));
  };

  const isBlocked = blockedCards[currentCard.id] ?? currentCard.isBlocked;

  // Credit limit calculations
  const limitUsed = currentCard.type === 'credit' ? currentCard.used : 0;
  const limitTotal = currentCard.type === 'credit' ? currentCard.limit : 0;
  const limitAvailable = limitTotal - limitUsed;
  const limitPercentage = limitTotal > 0 ? (limitUsed / limitTotal) * 100 : 0;

  const tabs: { key: typeof selectedTab; label: string }[] = [
    { key: 'debito', label: 'Débito' },
    { key: 'virtual', label: 'Virtual' },
    { key: 'credito', label: 'Crédito' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Meus Cartões</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setCardNumberVisible(prev => !prev)}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons
              name={cardNumberVisible ? 'eye' : 'eye-off'}
              size={22}
              color={cardNumberVisible ? colors.accent : colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent }]}>
            <Feather name="plus" size={18} color={colors.white} />
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: selectedTab === tab.key ? colors.accent : colors.surfaceLight,
                borderColor: selectedTab === tab.key ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: selectedTab === tab.key ? colors.white : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Card */}
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Frosted triangle decoration - RIGHT side */}
          <View style={styles.cardTriangleFrost} />

          {/* Bank logo + name */}
          <View style={styles.cardTopRow}>
            <View style={styles.cardLogoRow}>
              <View style={[styles.cardLogoTriangle, { borderBottomColor: colors.accent }]} />
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
          <Text style={styles.cardNumber}>
            {cardNumberVisible ? formatCardNumber(currentCard.number) : hiddenCardNumber}
          </Text>

          {/* Bottom row */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>Validade</Text>
              <Text style={styles.cardValue}>
                {cardNumberVisible ? currentCard.expirationDate : '••/••'}
              </Text>
            </View>
            <Text style={styles.cardFlag}>
              {currentCard.flag === 'visa' ? 'VISA' : 'MASTERCARD'}
            </Text>
          </View>
        </LinearGradient>

        {/* Credit Card Limit Progress Bar */}
        {currentCard.type === 'credit' && limitTotal > 0 && (
          <View style={[styles.limitCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.limitHeader}>
              <Text style={[styles.limitTitle, { color: colors.textPrimary }]}>Limite do cartão</Text>
              <Text style={[styles.limitPercentage, { color: limitPercentage > 80 ? colors.negative : colors.accent }]}>
                {cardNumberVisible ? `${limitPercentage.toFixed(0)}% utilizado` : '••••'}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceHover }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${limitPercentage}%`,
                    backgroundColor: limitPercentage > 80 ? colors.negative : colors.accent,
                  },
                ]}
              />
            </View>

            <View style={styles.limitValues}>
              <View>
                <Text style={[styles.limitLabel, { color: colors.textMuted }]}>Gasto</Text>
                <Text style={[styles.limitValue, { color: colors.negative }]}>
                  {cardNumberVisible
                    ? `R$ ${limitUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'R$ ••••'}
                </Text>
              </View>
              <View style={styles.limitRight}>
                <Text style={[styles.limitLabel, { color: colors.textMuted }]}>Disponível</Text>
                <Text style={[styles.limitValue, { color: colors.accent }]}>
                  {cardNumberVisible
                    ? `R$ ${limitAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'R$ ••••'}
                </Text>
              </View>
            </View>

            <View style={[styles.limitDivider, { backgroundColor: colors.menuDivider }]} />

            <View style={styles.limitTotalRow}>
              <Text style={[styles.limitLabel, { color: colors.textMuted }]}>Limite total</Text>
              <Text style={[styles.limitTotalValue, { color: colors.textPrimary }]}>
                {cardNumberVisible
                  ? `R$ ${limitTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : 'R$ ••••'}
              </Text>
            </View>
          </View>
        )}

        {/* Triangle Button - expand/collapse details */}
        <TouchableOpacity
          style={styles.triangleButtonContainer}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}
        >
          {/* Cor de fundo adicionada para o botão ser visível em modo claro e escuro */}
          <View style={[styles.triangleButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons
              name={showDetails ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textPrimary} 
            />
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.bloquearBtn, { backgroundColor: isBlocked ? colors.pixBg : colors.bloquearBtnBg }]}
            onPress={toggleBlock}
            activeOpacity={0.7}
          >
            {isBlocked ? (
              <>
                <Feather name="unlock" size={18} color={colors.accent} />
                <Text style={[styles.bloquearText, { color: colors.accent }]}>Desbloquear</Text>
              </>
            ) : (
              <>
                <Feather name="lock" size={18} color={colors.negative} />
                <Text style={[styles.bloquearText, { color: colors.negative }]}>Bloquear</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.faturaBtn, { backgroundColor: colors.faturaBtnBg, borderColor: colors.faturaBtnBorder }]}>
            <Feather name="file-text" size={18} color={colors.faturaText} />
            <Text style={[styles.faturaText, { color: colors.faturaText }]}>Ver fatura</Text>
          </TouchableOpacity>
        </View>

        {/* Details Table */}
        {showDetails && (
          <View style={[styles.detailsCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tipo</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {currentCard.type === 'credit' ? 'Crédito' : 'Débito'}
              </Text>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bandeira</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {currentCard.flag === 'visa' ? 'Visa' : 'Mastercard'}
              </Text>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Limite total</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {cardNumberVisible
                  ? (currentCard.limit > 0 ? `R$ ${currentCard.limit.toLocaleString('pt-BR')}` : 'N/A')
                  : 'R$ ••••'}
              </Text>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Limite disponível</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {cardNumberVisible
                  ? (currentCard.limit > 0 ? `R$ ${(currentCard.limit - currentCard.used).toLocaleString('pt-BR')}` : 'N/A')
                  : 'R$ ••••'}
              </Text>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.detailValue, { color: isBlocked ? colors.negative : colors.accent }]}>
                {isBlocked ? 'Bloqueado' : 'Ativo'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  headerActions: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  eyeButton: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  addButtonText: { color: '#FFFFFF', fontSize: FontSizes.sm, fontWeight: '600' },
  tabsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadii.md,
    borderWidth: 1,
  },
  tabText: { fontSize: FontSizes.md, fontWeight: '500' },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
  // Card
  card: {
    borderRadius: BorderRadii.xl, padding: Spacing.xxl, overflow: 'hidden',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, minHeight: 200,
    justifyContent: 'space-between',
  },
  // Triangle on RIGHT side
  cardTriangleFrost: {
    position: 'absolute', top: -20, right: -20,
    width: 0, height: 0,
    borderLeftWidth: 60, borderLeftColor: 'transparent',
    borderRightWidth: 60, borderRightColor: 'transparent',
    borderBottomWidth: 100, borderBottomColor: '#00A878',
    opacity: 0.15,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLogoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardLogoTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderLeftColor: 'transparent',
    borderRightWidth: 10, borderRightColor: 'transparent',
    borderBottomWidth: 16,
  },
  cardBankName: { fontSize: FontSizes.lg, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1 },
  cardTypeLabel: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.7)', fontWeight: '400' },
  cardChipRow: { marginVertical: Spacing.lg },
  cardNumber: {
    fontSize: FontSizes.xxl, fontWeight: '500', color: '#FFFFFF',
    letterSpacing: 3, marginBottom: Spacing.lg,
  },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { fontSize: FontSizes.xs, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  cardValue: { fontSize: FontSizes.md, color: '#FFFFFF', fontWeight: '500' },
  cardFlag: { fontSize: FontSizes.md, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1 },
  // Limit Card
  limitCard: {
    borderRadius: BorderRadii.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
  },
  limitHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  limitTitle: { fontSize: FontSizes.md, fontWeight: '600' },
  limitPercentage: { fontSize: FontSizes.sm, fontWeight: '600' },
  progressBarBg: {
    height: 8, borderRadius: 4, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', borderRadius: 4,
  },
  limitValues: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  limitRight: { alignItems: 'flex-end' },
  limitLabel: { fontSize: FontSizes.xs, marginBottom: 2 },
  limitValue: { fontSize: FontSizes.md, fontWeight: '700' },
  limitDivider: {
    height: 1, marginTop: Spacing.md, marginBottom: Spacing.md,
  },
  limitTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  limitTotalValue: { fontSize: FontSizes.md, fontWeight: '700' },
  // Triangle Button
  triangleButtonContainer: {
    alignItems: 'center', marginTop: -18, zIndex: 10,
  },
  triangleButton: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, 
    elevation: 4, // Sombra para destacar do cartão
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  // Action Buttons
  actionsRow: {
    flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg,
  },
  bloquearBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadii.lg,
    paddingVertical: Spacing.lg,
  },
  bloquearText: { fontSize: FontSizes.md, fontWeight: '600' },
  faturaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadii.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
  },
  faturaText: { fontSize: FontSizes.md, fontWeight: '500' },
  // Details
  detailsCard: {
    borderRadius: BorderRadii.lg,
    padding: Spacing.lg, marginTop: Spacing.lg,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  detailLabel: { fontSize: FontSizes.md },
  detailValue: { fontSize: FontSizes.md, fontWeight: '600' },
  detailDivider: { height: 1 },
});