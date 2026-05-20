import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { APP_VERSION } from '../utils';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export const MorePage: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { userData, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-$4')
    : '---';

  const menuSections = [
    {
      title: 'PIX',
      items: [
        { icon: 'qrcode', iconSet: 'MaterialCommunityIcons' as const, label: 'Gerar QR Code', navigate: 'QRCode' },
        { icon: 'qrcode-scan', iconSet: 'MaterialCommunityIcons' as const, label: 'Ler QR Code', navigate: 'Pagar' },
        { icon: 'key-variant', iconSet: 'MaterialCommunityIcons' as const, label: 'Minhas chaves Pix', navigate: 'ChavesPix' },
      ],
    },
    {
      title: 'MINHA CONTA',
      items: [
        { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados da conta', navigate: 'Conta' },
        { icon: 'cash-plus', iconSet: 'MaterialCommunityIcons' as const, label: 'Depositar', navigate: 'Depositar' },
        { icon: 'cash-minus', iconSet: 'MaterialCommunityIcons' as const, label: 'Sacar', navigate: 'Sacar' },
        { icon: 'file-text-outline', iconSet: 'MaterialCommunityIcons' as const, label: 'Extrato completo', navigate: 'Extrato' },
        { icon: 'trending-up', iconSet: 'Feather' as const, label: 'Investimentos', navigate: 'invest' },
        { icon: 'card-outline', iconSet: 'Ionicons' as const, label: 'Cartões', navigate: 'cards' },
      ],
    },
    {
      title: 'SERVIÇOS',
      items: [
        { icon: 'cellphone', iconSet: 'MaterialCommunityIcons' as const, label: 'Recarga de celular' },
        { icon: 'swap-horizontal', iconSet: 'MaterialCommunityIcons' as const, label: 'Câmbio' },
        { icon: 'shield-check-outline', iconSet: 'Ionicons' as const, label: 'Seguros' },
        { icon: 'cash', iconSet: 'MaterialCommunityIcons' as const, label: 'Empréstimos' },
      ],
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        { icon: 'settings-outline', iconSet: 'Ionicons' as const, label: 'Configurações do app', navigate: 'Config' },
      ],
    },
  ];

  const renderIcon = (icon: string, iconSet: string) => {
    const size = 20;
    const color = colors.accent;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
    return <Feather name={icon as any} size={size} color={color} />;
  };

  const handlePress = (item: any) => {
    if (!item.navigate) return;
    if (item.navigate === 'invest' || item.navigate === 'cards' || item.navigate === 'home') {
      navigation?.navigate('Main', { screen: item.navigate });
    } else {
      navigation?.navigate(item.navigate);
    }
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mais serviços</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.sectionCardBg, borderColor: colors.border }]}>
              {section.items.map((item: any, iIdx: number) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[styles.menuItem, iIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.menuDivider }]}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: colors.menuIconBg }]}>
                    {renderIcon(item.icon, item.iconSet)}
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                  <Feather name="chevron-right" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

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
  header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: { fontSize: FontSizes.huge, fontWeight: '700' },
  scrollContent: { paddingBottom: Spacing.xxxl },
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
  menuIcon: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuLabel: { flex: 1, fontSize: FontSizes.lg, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1,
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#E53935' },
  version: { textAlign: 'center', fontSize: FontSizes.sm, marginTop: Spacing.xl },
});
