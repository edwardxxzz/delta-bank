import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export const MorePage: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { userData, logout } = useAuth();

  const menuSections = [
    {
      title: 'CONTA',
      items: [
        { icon: 'person-outline', iconSet: 'Ionicons' as const, label: 'Dados pessoais', subtitle: 'Nome, email, telefone' },
        { icon: 'shield-check-outline', iconSet: 'MaterialCommunityIcons' as const, label: 'Segurança', subtitle: 'Senha, 2FA, biometria' },
        { icon: 'notifications-outline', iconSet: 'Ionicons' as const, label: 'Notificações', subtitle: 'Alertas e Push' },
      ],
    },
    {
      title: 'PREFERÊNCIAS',
      items: [
        { icon: 'phone-portrait-outline', iconSet: 'Ionicons' as const, label: 'Aparência', subtitle: 'Tema e idioma' },
        { icon: 'globe-outline', iconSet: 'Ionicons' as const, label: 'Idioma', subtitle: 'Português (BR)' },
        { icon: 'palette-outline', iconSet: 'MaterialCommunityIcons' as const, label: 'Personalização', subtitle: 'Cores e layout' },
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
    const size = 18;
    const color = Colors.primary;
    if (iconSet === 'Ionicons') return <Ionicons name={icon as any} size={size} color={color} />;
    if (iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
    return <Feather name={icon as any} size={size} color={color} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mais</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitial}>
            {userData?.nome?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData?.nome || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>CPF: {userData?.cpf || '---'}</Text>
        </View>
        <Feather name="chevron-right" size={22} color={Colors.textMuted} />
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
                  onPress={() => {}}
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

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Feather name="log-out" size={20} color="#E53935" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Delta Bank v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  headerTitle: { fontSize: FontSizes.huge, fontWeight: '700', color: Colors.textPrimary },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.lg, padding: Spacing.lg, marginBottom: Spacing.xl, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  profileInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  scrollContent: { paddingBottom: Spacing.xxl },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: Spacing.xxl, marginBottom: Spacing.sm },
  sectionCard: { backgroundColor: Colors.white, marginHorizontal: Spacing.xxl, borderRadius: BorderRadii.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIcon: { width: 36, height: 36, borderRadius: BorderRadii.sm, backgroundColor: 'rgba(26, 35, 126, 0.06)', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: FontSizes.lg, fontWeight: '500', color: Colors.textPrimary },
  menuSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.white, marginHorizontal: Spacing.xxl, marginTop: Spacing.xl, paddingVertical: Spacing.lg, borderRadius: BorderRadii.lg, borderWidth: 1, borderColor: '#FFCDD2' },
  logoutText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#E53935' },
  version: { textAlign: 'center', fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: Spacing.xl },
});
