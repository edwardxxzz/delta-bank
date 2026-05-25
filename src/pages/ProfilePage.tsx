import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, findNodeHandle, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, formatBRL } from '../services/apiService';
import { APP_VERSION } from '../utils';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface ProfilePageProps {
  navigation?: any;
  route?: any;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { userData, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const logoutY = useRef<number>(0);

  // Scroll to logout when navigated with scrollToLogout param
  React.useEffect(() => {
    if (route?.params?.scrollToLogout) {
      // Give the scrollview time to layout, then scroll to logout position
      const timer = setTimeout(() => {
        if (logoutY.current > 0) {
          scrollViewRef.current?.scrollTo({ y: logoutY.current - 120, animated: true });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.scrollToLogout]);

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;
  const limite = userData ? centsToBRL(userData?.limite_diario || 0) : 0;
  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-$4')
    : '---';

  const menuItems = [
    { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados pessoais', subtitle: 'Nome, email, telefone', navigate: 'Conta' },
    { icon: 'shield-outline', iconSet: 'Ionicons' as const, label: 'Segurança', subtitle: 'Senha, 2FA, biometria', navigate: 'Config' },
    { icon: 'key-outline', iconSet: 'Ionicons' as const, label: 'Alterar senha', subtitle: 'Mudar senha de acesso', navigate: 'Config' },
    { icon: 'notifications-outline', iconSet: 'Ionicons' as const, label: 'Notificações', subtitle: 'Alertas e Push', navigate: 'Config' },
    { icon: 'phone-portrait-outline', iconSet: 'Ionicons' as const, label: 'Aparência', subtitle: 'Tema e idioma', navigate: 'Config' },
    { icon: 'help-circle-outline', iconSet: 'Ionicons' as const, label: 'Central de ajuda', subtitle: 'Dúvidas e suporte', navigate: 'Config' },
  ];

  const renderIcon = (icon: string, iconSet: string) => {
    const size = 20;
    const color = colors.accent;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
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

  const handleNavigate = (navigate: string | undefined) => {
    if (!navigate) return;
    navigation?.navigate?.(navigate);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {/* Avatar */}
        <View style={[styles.profileSection, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.pixBg, borderColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {userData?.nome?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>
            {userData?.nome || 'Usuário'}
          </Text>
          <Text style={[styles.cpf, { color: colors.textSecondary }]}>CPF: {formattedCPF}</Text>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Saldo em conta</Text>
              <Text style={[styles.balanceValue, { color: colors.textPrimary }]}>R$ {formatBRL(balance)}</Text>
            </View>
            <View style={[styles.balanceIconContainer, { backgroundColor: colors.pixBg }]}>
              <MaterialCommunityIcons name="wallet-outline" size={24} color={colors.accent} />
            </View>
          </View>
          <View style={[styles.balanceDivider, { backgroundColor: colors.border }]} />
          <View style={styles.limitRow}>
            <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>Limite diário</Text>
            <Text style={[styles.limitValue, { color: colors.accent }]}>R$ {formatBRL(limite)}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menuSection, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem, idx < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.menuDivider }]}
              onPress={() => handleNavigate(item.navigate)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.menuIconBg }]}>
                {renderIcon(item.icon, item.iconSet)}
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                {item.subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>}
              </View>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout - measure Y position using onLayout */}
        <View
          onLayout={(e) => { logoutY.current = e.nativeEvent.layout.y; }}
          collapsable={false}
        >
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.cardBg, borderColor: colors.logoutBorder }]} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={colors.negative} />
            <Text style={[styles.logoutText, { color: colors.negative }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

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
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl, borderBottomWidth: 1,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg, borderWidth: 2,
  },
  avatarText: { fontSize: 32, fontWeight: '700' },
  name: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xxl,
    textAlign: 'center',
    flexShrink: 1,
  },
  cpf: { fontSize: FontSizes.md },
  balanceCard: {
    marginHorizontal: Spacing.xxl, 
    marginTop: Spacing.xl, // <-- Ajustado aqui (removido o sinal de negativo)
    borderRadius: BorderRadii.xl, padding: Spacing.xxl,
    borderWidth: 1,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: FontSizes.md, marginBottom: Spacing.xs },
  balanceValue: { fontSize: FontSizes.giant, fontWeight: '700' },
  balanceIconContainer: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  balanceDivider: { height: 1, marginVertical: Spacing.lg },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  limitLabel: { fontSize: FontSizes.md },
  limitValue: { fontSize: FontSizes.md, fontWeight: '600' },
  menuSection: {
    marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    borderRadius: BorderRadii.lg, overflow: 'hidden', borderWidth: 1,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  menuIcon: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: FontSizes.lg, fontWeight: '500' },
  menuSubtitle: { fontSize: FontSizes.sm, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1,
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.xl },
});
