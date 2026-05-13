import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface ContaPageProps {
  navigation?: any;
}

export const ContaPage: React.FC<ContaPageProps> = ({ navigation }) => {
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
    const color = Colors.textMuted;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
    return <Feather name={icon as any} size={size} color={color} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Dados da Conta</Text>
          <Text style={styles.headerSubtitle}>Suas informações bancárias</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{firstName}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData?.nome || 'Usuário'}</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileEmail}>{email}</Text>
              <View style={styles.accountBadge}>
                <Text style={styles.accountBadgeText}>Conta Corrente</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.infoCard}>
          {accountInfo.map((item, idx) => (
            <View key={idx}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  {renderIcon(item.icon, item.iconSet)}
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
              {idx < accountInfo.length - 1 && <View style={styles.infoDivider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  scrollContent: { paddingBottom: Spacing.xxxl },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.xl,
    padding: Spacing.xl, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  profileInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  accountBadge: {
    backgroundColor: Colors.pixBg, borderRadius: BorderRadii.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  accountBadgeText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.accent },
  infoCard: {
    backgroundColor: Colors.white, marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg,
  },
  infoIconContainer: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary },
  infoDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: Spacing.xxxl + 38 + Spacing.lg },
});
