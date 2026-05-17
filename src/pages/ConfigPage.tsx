import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { APP_VERSION } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ConfigPageProps {
  navigation?: any;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ navigation }) => {
  const { userData, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [biometria, setBiometria] = useState(false);
  const [ocultarSaldo, setOcultarSaldo] = useState(false);
  const [notificacoes, setNotificacoes] = useState(true);

  const firstName = userData?.nome?.charAt(0)?.toUpperCase() || 'U';


  const accountItems = [
    { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados da conta', navigate: 'Conta' },
    { icon: 'shield-check-outline', iconSet: 'Ionicons' as const, label: 'Segurança' },
    { icon: 'fingerprint', iconSet: 'MaterialCommunityIcons' as const, label: 'Biometria', toggle: true, value: biometria, onToggle: setBiometria },
  ];

  const privacyItems = [
    { icon: 'eye-off-outline', iconSet: 'Ionicons' as const, label: 'Ocultar saldo', toggle: true, value: ocultarSaldo, onToggle: setOcultarSaldo },
    { icon: 'notifications-outline', iconSet: 'Ionicons' as const, label: 'Notificações', toggle: true, value: notificacoes, onToggle: setNotificacoes },
  ];

  const appearanceItems = [
    { icon: 'moon-outline', iconSet: 'Ionicons' as const, label: 'Tema escuro', toggle: true, value: isDark, onToggle: toggleTheme },
  ];

  const supportItems = [
    { icon: 'help-circle-outline', iconSet: 'Ionicons' as const, label: 'Ajuda e suporte' },
    { icon: 'file-document-outline', iconSet: 'MaterialCommunityIcons' as const, label: 'Termos e privacidade' },
    { icon: 'information-outline', iconSet: 'Ionicons' as const, label: 'Sobre o app' },
  ];

  const renderIcon = (icon: string, iconSet: string) => {
    const size = 20;
    const color = colors.accent;
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
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
        {items.map((item: any, idx: number) => (
          <View key={idx}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => item.navigate ? navigation?.navigate?.(item.navigate) : item.toggle ? item.onToggle() : {}}
              activeOpacity={item.toggle ? 1 : 0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.menuIconBg }]}>
                {renderIcon(item.icon, item.iconSet)}
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: colors.switchTrackFalse, true: colors.accent }}
                  thumbColor={colors.white}
                />
              ) : (
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
            {idx < items.length - 1 && <View style={[styles.menuDivider, { backgroundColor: colors.menuDivider }]} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>
        {/* Profile Card */}
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{firstName}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData?.nome || 'Usuário'}</Text>
            
          </View>
        </LinearGradient>

        {renderSection('CONTA', accountItems)}
        {renderSection('APARÊNCIA', appearanceItems)}
        {renderSection('PRIVACIDADE', privacyItems)}
        {renderSection('SUPORTE', supportItems)}

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.sectionCardBg, borderColor: colors.logoutBorder }]} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.negative} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>{APP_VERSION}</Text>
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
  scrollContent: { paddingBottom: Spacing.xxxl },
  // Profile
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.xl, padding: Spacing.xl, marginBottom: Spacing.xl,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  profileInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.xxl, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  profileEmail: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.7)' },
  // Sections
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSizes.sm, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.sm,
  },
  sectionCard: {
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadii.lg, overflow: 'hidden', borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
  },
  menuDivider: { height: 1, marginLeft: Spacing.xxxl + 38 + Spacing.lg },
  menuIcon: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuLabel: { flex: 1, fontSize: FontSizes.lg, fontWeight: '500' },
  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1,
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.xl },
});
