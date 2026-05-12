import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export const MorePage: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { userData, logout } = useAuth();

  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '---';

  const menuSections = [
    {
      title: 'CONTA',
      items: [
        { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados pessoais', subtitle: 'Nome, email, telefone', navigate: 'Profile' },
        { icon: 'shield-check-outline', iconSet: 'Ionicons' as const, label: 'Segurança', subtitle: 'Senha, 2FA, biometria' },
        { icon: 'notifications-outline', iconSet: 'Ionicons' as const, label: 'Notificações', subtitle: 'Alertas e Push' },
      ],
    },
    {
      title: 'SERVIÇOS',
      items: [
        { icon: 'swap-horizontal-bold', iconSet: 'MaterialCommunityIcons' as const, label: 'Pix', subtitle: 'Envio e recebimento', navigate: 'Pix' },
        { icon: 'cash-plus', iconSet: 'MaterialCommunityIcons' as const, label: 'Depositar', subtitle: 'Adicionar saldo', navigate: 'Depositar' },
        { icon: 'cash-minus', iconSet: 'MaterialCommunityIcons' as const, label: 'Sacar', subtitle: 'Retirar saldo', navigate: 'Sacar' },
      ],
    },
    {
      title: 'PREFERÊNCIAS',
      items: [
        { icon: 'phone-portrait-outline', iconSet: 'Ionicons' as const, label: 'Aparência', subtitle: 'Tema e idioma' },
        { icon: 'globe-outline', iconSet: 'Ionicons' as const, label: 'Idioma', subtitle: 'Português (BR)' },
      ],
    },
    {
      title: 'SUPORTE',
      items: [
        { icon: 'help-circle-outline', iconSet: 'Ionicons' as const, label: 'Central de ajuda' },
        { icon: 'chatbubble-outline', iconSet: 'Ionicons' as const, label: 'Chat com suporte' },
        { icon: 'file-text-outline', iconSet: 'MaterialCommunityIcons' as const, label: 'Termos e políticas' },
      ],
    },
  ];

  const renderIcon = (icon: string, iconSet: string) => {
    const size = 20;
    const color = Colors.accent;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mais</Text>
      </View>

      {/* Profile Card */}
      <TouchableOpacity style={styles.profileCard} onPress={() => navigation?.navigate?.('Profile')}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitial}>
            {userData?.nome?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData?.nome || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>CPF: {formattedCPF}</Text>
        </View>
        <Feather name="chevron-right" size={22} color={Colors.textMuted} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item: any, iIdx: number) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[styles.menuItem, iIdx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => item.navigate ? navigation?.navigate?.(item.navigate) : {}}
                >
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
          </View>
        ))}

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
  header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.white },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.lg, padding: Spacing.lg,
    marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0, 230, 118, 0.15)', justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg, borderWidth: 1.5, borderColor: Colors.accent,
  },
  profileInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.accent },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.white },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  scrollContent: { paddingBottom: Spacing.xxl },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.xxl,
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
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1, borderColor: 'rgba(255, 82, 82, 0.2)',
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.negative },
  version: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xl },
});
