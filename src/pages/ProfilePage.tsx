import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL } from '../services/apiService';

interface ProfilePageProps {
  navigation?: any;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigation }) => {
  const { userData, logout } = useAuth();

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;
  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '---';

  const menuItems = [
    { icon: '👤', label: 'Dados pessoais', subtitle: 'Nome, email, telefone' },
    { icon: '🛡️', label: 'Segurança', subtitle: 'Senha, 2FA, biometria' },
    { icon: '🔑', label: 'Alterar senha', subtitle: 'Mudar senha de acesso' },
    { icon: '🔔', label: 'Notificações', subtitle: 'Alertas e Push' },
    { icon: '📱', label: 'Aparência', subtitle: 'Tema e idioma' },
    { icon: '❓', label: 'Central de ajuda', subtitle: 'Dúvidas e suporte' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.nome?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{userData?.nome || 'Usuário'}</Text>
          <Text style={styles.cpf}>CPF: {formattedCPF}</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo em conta</Text>
          <Text style={styles.balanceValue}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Limite diário</Text>
            <Text style={styles.limitValue}>
              R$ {centsToBRL(userData?.limite_diario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
              </View>
              <Text style={{ fontSize: 22, color: Colors.textMuted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={{ fontSize: 20 }}>🚪</Text>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Delta Bank v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: Colors.white, fontSize: 24, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
  scrollContent: { paddingBottom: Spacing.xxxl },
  profileSection: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.white },
  name: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  cpf: { fontSize: FontSizes.md, color: Colors.textSecondary },
  balanceCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xxl,
    marginTop: -Spacing.xl,
    borderRadius: BorderRadii.xl,
    padding: Spacing.xxl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceLabel: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xs },
  balanceValue: { fontSize: FontSizes.giant, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.lg },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  limitLabel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  limitValue: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.primary },
  menuSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.xl,
    borderRadius: BorderRadii.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadii.sm,
    backgroundColor: 'rgba(26, 35, 126, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: FontSizes.lg, fontWeight: '500', color: Colors.textPrimary },
  menuSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadii.lg,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#E53935' },
  version: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xl },
});
