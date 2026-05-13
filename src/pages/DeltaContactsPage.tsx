import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.newContactBtn} activeOpacity={0.7}>
          <Ionicons name="add" size={18} color={Colors.white} />
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
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar contato..."
          placeholderTextColor={Colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Favorites */}
        {favorites.length > 0 && !searchText && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={14} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>FAVORITOS</Text>
            </View>
            <View style={styles.favoritesRow}>
              {favorites.map((contact) => (
                <TouchableOpacity key={contact.id} style={styles.favoriteItem} activeOpacity={0.7}>
                  <View style={[styles.favoriteAvatar, { backgroundColor: contact.color }]}>
                    <Text style={styles.favoriteInitial}>{contact.initial}</Text>
                  </View>
                  <Text style={styles.favoriteName}>{contact.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Contacts PIX */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="swap-horizontal-bold" size={14} color={Colors.textMuted} />
            <Text style={styles.sectionTitle}>CONTATOS PIX</Text>
          </View>
          {allContacts.map((contact) => (
            <TouchableOpacity key={contact.id} style={styles.contactItem} activeOpacity={0.7}>
              <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                <Text style={styles.contactInitial}>{contact.initial}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDetail}>{contact.detail}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
  },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  newContactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.accent, borderRadius: BorderRadii.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
  },
  newContactText: { color: Colors.white, fontSize: FontSizes.md, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
  },
  actionCard: { alignItems: 'center', gap: Spacing.sm },
  actionIcon: {
    width: 56, height: 56, borderRadius: BorderRadii.md,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadii.lg,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg, height: 46,
  },
  searchIcon: { marginRight: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSizes.md, color: Colors.textPrimary },
  scrollContent: { paddingBottom: Spacing.xxxl },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textMuted,
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
  favoriteInitial: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.white },
  favoriteName: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  contactItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  contactAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.lg,
  },
  contactInitial: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white },
  contactInfo: { flex: 1 },
  contactName: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  contactDetail: { fontSize: FontSizes.sm, color: Colors.textSecondary },
});
