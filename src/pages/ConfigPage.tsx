import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface ConfigPageProps {
  navigation?: any;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ navigation }) => {
  const { userData, logout } = useAuth();
  const [biometria, setBiometria] = useState(false);
  const [ocultarSaldo, setOcultarSaldo] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);

  const firstName = userData?.nome?.charAt(0)?.toUpperCase() || 'U';
  const email = 'roberto.edward@gmail.com'; // Mock since backend doesn't provide email

  const accountItems = [
    { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados da conta', navigate: 'Conta' },
    { icon: 'shield-check-outline', iconSet: 'Ionicons' as const, label: 'Segurança' },
    { icon: 'fingerprint', iconSet: 'MaterialCommunityIcons' as const, label: 'Biometria', toggle: true, value: biometria, onToggle: setBiometria },
  ];

  const privacyItems = [
    { icon: 'eye-off-outline', iconSet: 'Ionicons' as const, label: 'Ocultar saldo', toggle: true, value: ocultarSaldo, onToggle: setOcultarSaldo },
    { icon: 'notifications-outline', iconSet: 'Ionicons' as const, label: 'Notificações', toggle: true, value: notificacoes, onToggle: setNotificacoes },
  ];

  const supportItems = [
    { icon: 'help-circle-outline', iconSet: 'Ionicons' as const, label: 'Ajuda e suporte' },
    { icon: 'file-document-outline', iconSet: 'MaterialCommunityIcons' as const, label: 'Termos e privacidade' },
    { icon: 'information-outline', iconSet: 'Ionicons' as const, label: 'Sobre o app' },
  ];

  const renderIcon = (icon: string, iconSet: string) => {
    const size = 20;
    const color = Colors.textMuted;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
    return <Feather name={icon as any} size={size} color={color} />;
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta', 'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  const renderSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item: any, idx: number) => (
          <View key={idx}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => item.navigate ? navigation?.navigate?.(item.navigate) : {}}
              activeOpacity={item.toggle ? 1 : 0.7}
            >
              <View style={styles.menuIcon}>
                {renderIcon(item.icon, item.iconSet)}
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#D1D5DB', true: Colors.accent }}
                  thumbColor={Colors.white}
                />
              ) : (
                <Feather name="chevron-right" size={18} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
            {idx < items.length - 1 && <View style={styles.menuDivider} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
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
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
        </View>

        {renderSection('CONTA', accountItems)}
        {renderSection('PRIVACIDADE', privacyItems)}
        {renderSection('SUPORTE', supportItems)}

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
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary },
  scrollContent: { paddingBottom: Spacing.xxxl },
  // Profile
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.xl, padding: Spacing.xl, marginBottom: Spacing.xl,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  profileInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white, marginBottom: 2 },
  profileEmail: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.7)' },
  // Sections
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.white, marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
  },
  menuDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: Spacing.xxxl + 38 + Spacing.lg },
  menuIcon: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuLabel: { flex: 1, fontSize: FontSizes.lg, fontWeight: '500', color: Colors.textPrimary },
  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1, borderColor: '#FEE2E2',
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.negative },
  version: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.lg },
});
