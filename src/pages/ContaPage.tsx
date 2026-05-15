import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface ContaPageProps {
  navigation?: any;
}

export const ContaPage: React.FC<ContaPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();

  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '---';

  const firstName = userData?.nome?.charAt(0)?.toUpperCase() || 'U';
  const email = 'roberto01fonsec@gmail.com'; // Mock since backend doesn't provide email

  const accountInfo = [
    { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Nome completo', value: userData?.nome || '---', editable: false },
    { icon: 'card-account-details-outline', iconSet: 'MaterialCommunityIcons' as const, label: 'CPF', value: '•••••••••••', editable: false },
    { icon: 'business-outline', iconSet: 'Ionicons' as const, label: 'Banco', value: 'Delta Bank (000)', editable: false },
    { icon: 'hash', iconSet: 'Feather' as const, label: 'Agência', value: '0001', editable: false },
    { icon: 'hash', iconSet: 'Feather' as const, label: 'Conta', value: '88028-5', editable: false },
    { icon: 'link-variant', iconSet: 'MaterialCommunityIcons' as const, label: 'Chave Pix (e-mail)', value: email, editable: false },
  ];

  const renderIcon = (icon: string, iconSet: string) => {
    const size = 20;
    const color = colors.textMuted;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
    return <Feather name={icon as any} size={size} color={color} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dados da Conta</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Suas informações bancárias</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.profileInitial}>{firstName}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{userData?.nome || 'Usuário'}</Text>
            <View style={styles.profileRow}>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{email}</Text>
              <View style={[styles.accountBadge, { backgroundColor: colors.pixBg }]}>
                <Text style={[styles.accountBadgeText, { color: colors.accent }]}>Conta Corrente</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={[styles.infoCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
          {accountInfo.map((item, idx) => (
            <View key={idx}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIconContainer, { backgroundColor: colors.surfaceLight }]}>
                  {renderIcon(item.icon, item.iconSet)}
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{item.value}</Text>
                </View>
              </View>
              {idx < accountInfo.length - 1 && <View style={[styles.infoDivider, { backgroundColor: colors.menuDivider }]} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  headerSubtitle: { fontSize: FontSizes.sm, marginTop: 2 },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl + 40 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.xl,
    padding: Spacing.xl, marginBottom: Spacing.xl,
    borderWidth: 1,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  profileInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.xxl, fontWeight: '700', marginBottom: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  profileEmail: { fontSize: FontSizes.sm },
  accountBadge: {
    borderRadius: BorderRadii.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  accountBadgeText: { fontSize: FontSizes.xs, fontWeight: '600' },
  infoCard: {
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.lg, overflow: 'hidden',
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg,
  },
  infoIconContainer: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSizes.sm, marginBottom: 2 },
  infoValue: { fontSize: FontSizes.lg, fontWeight: '600' },
  infoDivider: { height: 1, marginLeft: Spacing.xxxl + 38 + Spacing.lg },
});
