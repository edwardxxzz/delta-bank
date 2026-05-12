import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, formatBRL } from '../services/apiService';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface ProfilePageProps {
  navigation?: any;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigation }) => {
  const { userData, logout } = useAuth();

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;
  const limite = userData ? centsToBRL(userData?.limite_diario || 0) : 0;
  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '---';

  const menuItems = [
    { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados pessoais', subtitle: 'Nome, email, telefone' },
    { icon: 'shield-check-outline', iconSet: 'Ionicons' as const, label: 'Segurança', subtitle: 'Senha, 2FA, biometria' },
    { icon: 'key-outline', iconSet: 'Ionicons' as const, label: 'Alterar senha', subtitle: 'Mudar senha de acesso' },
    { icon: 'notifications-outline', iconSet: 'Ionicons' as const, label: 'Notificações', subtitle: 'Alertas e Push' },
    { icon: 'phone-portrait-outline', iconSet: 'Ionicons' as const, label: 'Aparência', subtitle: 'Tema e idioma' },
    { icon: 'help-circle-outline', iconSet: 'Ionicons' as const, label: 'Central de ajuda', subtitle: 'Dúvidas e suporte' },
  ];

  const renderIcon = (icon: string, iconSet: string) => {
    const size = 20;
    const color = Colors.accent;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
    return <Feather name={icon as any} size={size} color={color} />;
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#0D1F3C', '#162240']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.nome?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{userData?.nome || 'Usuário'}</Text>
          <Text style={styles.cpf}>CPF: {formattedCPF}</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Saldo em conta</Text>
              <Text style={styles.balanceValue}>R$ {formatBRL(balance)}</Text>
            </View>
            <View style={styles.balanceIconContainer}>
              <MaterialCommunityIcons name="wallet-outline" size={24} color={Colors.accent} />
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Limite diário</Text>
            <Text style={styles.limitValue}>R$ {formatBRL(limite)}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}>
              <View style={styles.menuIcon}>
                {renderIcon(item.icon, item.iconSet)}
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={Colors.negative} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Delta Bank v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
  scrollContent: { paddingBottom: Spacing.xxxl },
  // Profile
  profileSection: {
    alignItems: 'center', backgroundColor: Colors.surface,
    paddingVertical: Spacing.xxl, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(0, 230, 118, 0.15)', justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg, borderWidth: 2, borderColor: Colors.accent,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.accent },
  name: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs },
  cpf: { fontSize: FontSizes.md, color: Colors.textSecondary },
  // Balance
  balanceCard: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.xxl, marginTop: -Spacing.xl,
    borderRadius: BorderRadii.xl, padding: Spacing.xxl,
    borderWidth: 1, borderColor: Colors.border,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xs },
  balanceValue: { fontSize: FontSizes.giant, fontWeight: '700', color: Colors.white },
  balanceIconContainer: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.pixBg, justifyContent: 'center', alignItems: 'center',
  },
  balanceDivider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.lg },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  limitLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  limitValue: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.accent },
  // Menu
  menuSection: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    borderRadius: BorderRadii.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    backgroundColor: 'rgba(0, 230, 118, 0.08)', justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: FontSizes.lg, fontWeight: '500', color: Colors.white },
  menuSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.2)',
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.negative },
  version: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xl },
});
