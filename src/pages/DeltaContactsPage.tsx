import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface Contact {
  id: string;
  name: string;
  initial: string;
  color: string;
  detail: string;
  isFavorite?: boolean;
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Marina Souza', initial: 'M', color: '#F97316', detail: '11999887766 - Inter', isFavorite: true },
  { id: '2', name: 'Carlos Oliveira', initial: 'C', color: '#8B5CF6', detail: 'carlos@email.com - Nubank', isFavorite: true },
  { id: '3', name: 'Pedro Lima', initial: 'P', color: '#3B82F6', detail: '123.456.789-00 - Bradesco' },
  { id: '4', name: 'Agência Criativa', initial: 'A', color: '#10B981', detail: '12.345.678/0001-99 - Itaú' },
];

interface DeltaContactsPageProps {
  navigation?: any;
}

export const DeltaContactsPage: React.FC<DeltaContactsPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');

  const favorites = mockContacts.filter(c => c.isFavorite);
  const allContacts = mockContacts.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.detail.toLowerCase().includes(searchText.toLowerCase())
  );

  const quickActions = [
    { label: 'Transferir', icon: 'send', color: '#3B82F6', bg: '#DBEAFE', onPress: () => navigation?.navigate?.('Transferir') },
    { label: 'Receber', icon: 'arrow-down', color: '#10B981', bg: '#D1FAE5', onPress: () => navigation?.navigate?.('Receber') },
    { label: 'Cobrar', icon: 'credit-card', color: '#14B8A6', bg: '#CCFBF1', onPress: () => navigation?.navigate?.('QRCode') },
    { label: 'Pagar QR', icon: 'qrcode', color: '#8B5CF6', bg: '#EDE9FE', onPress: () => navigation?.navigate?.('Pagar') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.newContactBtn, { backgroundColor: colors.accent }]} activeOpacity={0.7}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.newContactText}>Novo contato</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        {quickActions.map((action, idx) => (
          <TouchableOpacity key={idx} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
              <MaterialCommunityIcons name={action.icon as any} size={22} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar contato..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Favorites */}
        {favorites.length > 0 && !searchText && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={14} color={colors.textMuted} />
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>FAVORITOS</Text>
            </View>
            <View style={styles.favoritesRow}>
              {favorites.map((contact) => (
                <TouchableOpacity key={contact.id} style={styles.favoriteItem} activeOpacity={0.7}>
                  <View style={[styles.favoriteAvatar, { backgroundColor: contact.color }]}>
                    <Text style={styles.favoriteInitial}>{contact.initial}</Text>
                  </View>
                  <Text style={[styles.favoriteName, { color: colors.textSecondary }]}>{contact.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Contacts PIX */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="swap-horizontal-bold" size={14} color={colors.textMuted} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CONTATOS PIX</Text>
          </View>
          {allContacts.map((contact) => (
            <TouchableOpacity key={contact.id} style={[styles.contactItem, { borderBottomColor: colors.menuDivider }]} activeOpacity={0.7}>
              <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                <Text style={styles.contactInitial}>{contact.initial}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.textPrimary }]}>{contact.name}</Text>
                <Text style={[styles.contactDetail, { color: colors.textSecondary }]}>{contact.detail}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  newContactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  newContactText: { color: '#FFFFFF', fontSize: FontSizes.md, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
  },
  actionCard: { alignItems: 'center', gap: Spacing.sm },
  actionIcon: {
    width: 56, height: 56, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: FontSizes.sm, fontWeight: '500' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg, height: 46,
  },
  searchIcon: { marginRight: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSizes.md },
  scrollContent: { paddingBottom: Spacing.xxxl },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.sm, fontWeight: '700',
    letterSpacing: 0.5,
  },
  favoritesRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xxl, gap: Spacing.lg,
  },
  favoriteItem: { alignItems: 'center', gap: Spacing.xs },
  favoriteAvatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  favoriteInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: '#FFFFFF' },
  favoriteName: { fontSize: FontSizes.sm },
  contactItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  contactAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  contactInitial: { fontSize: FontSizes.lg, fontWeight: '700', color: '#FFFFFF' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: FontSizes.lg, fontWeight: '600', marginBottom: 2 },
  contactDetail: { fontSize: FontSizes.sm },
});
