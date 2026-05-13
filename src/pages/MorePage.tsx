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
      title: 'PIX',
      items: [
        { icon: 'qrcode', iconSet: 'MaterialCommunityIcons' as const, label: 'Gerar QR Code', navigate: 'QRCode' },
        { icon: 'qrcode-scan', iconSet: 'MaterialCommunityIcons' as const, label: 'Ler QR Code', navigate: 'Pagar' },
        { icon: 'key-variant', iconSet: 'MaterialCommunityIcons' as const, label: 'Minhas chaves Pix' },
      ],
    },
    {
      title: 'MINHA CONTA',
      items: [
        { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados da conta', navigate: 'Profile' },
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
        { icon: 'settings-outline', iconSet: 'Ionicons' as const, label: 'Configurações do app' },
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

  const handlePress = (item: any) => {
    if (!item.navigate) return;
    // Tab navigation items need special handling - navigate to Main and then switch tab
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mais serviços</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item: any, iIdx: number) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[styles.menuItem, iIdx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIcon}>
                    {renderIcon(item.icon, item.iconSet)}
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
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
  headerTitle: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.textPrimary },
  scrollContent: { paddingBottom: Spacing.xxxl },
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
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIcon: {
    width: 38, height: 38, borderRadius: BorderRadii.sm,
    backgroundColor: Colors.pixBg, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuLabel: { flex: 1, fontSize: FontSizes.lg, fontWeight: '500', color: Colors.textPrimary },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, marginHorizontal: Spacing.xxl, marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1, borderColor: '#FEE2E2',
  },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.negative },
  version: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xl },
});
