import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getChavesPix, ChavePix, validatePixKey } from '../services/apiService';

interface Contact {
  id: string;
  name: string;
  initial: string;
  color: string;
  chaveTipo: string;
  chaveValor: string;
  cpf: string;
  isFavorite?: boolean;
}

const avatarColors = ['#F97316', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#6366F1', '#EF4444', '#14B8A6'];

interface DeltaContactsPageProps {
  navigation?: any;
}

export const DeltaContactsPage: React.FC<DeltaContactsPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResult, setSearchResult] = useState<Contact | null>(null);
  const [searching, setSearching] = useState(false);

  const loadContacts = useCallback(async () => {
    // For now, we don't have a contacts endpoint on the backend
    // Contacts are derived from Pix transactions
    // We'll start with empty and allow adding by searching CPF
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleSearchContact = async () => {
    const query = searchText.trim().replace(/\D/g, '');
    if (query.length !== 11) {
      Alert.alert('CPF inválido', 'Digite um CPF válido com 11 dígitos para buscar.');
      return;
    }
    if (query === userData?.cpf) {
      Alert.alert('Erro', 'Você não pode adicionar a si mesmo como contato.');
      return;
    }

    setSearching(true);
    setSearchResult(null);
    try {
      const res = await validatePixKey(query);
      if (res.sucesso && res.dados?.Conta) {
        const conta = res.dados.Conta;
        const newContact: Contact = {
          id: conta.cpf,
          name: conta.nome,
          initial: conta.nome.charAt(0).toUpperCase(),
          color: avatarColors[Math.floor(Math.random() * avatarColors.length)],
          chaveTipo: 'CPF',
          chaveValor: conta.cpf,
          cpf: conta.cpf,
        };
        setSearchResult(newContact);
      } else {
        Alert.alert('Não encontrado', 'CPF não encontrado no Delta Bank.');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao buscar contato. Tente novamente.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddContact = (contact: Contact) => {
    // Check if already exists
    if (contacts.some(c => c.cpf === contact.cpf)) {
      Alert.alert('Contato já existe', 'Este contato já está na sua lista.');
      return;
    }
    setContacts(prev => [...prev, { ...contact, isFavorite: false }]);
    setSearchResult(null);
    setSearchText('');
  };

  const handleContactPress = (contact: Contact) => {
    // Navigate to Transferir with the contact's key pre-filled
    navigation?.navigate('Transferir', { chaveDestino: contact.chaveValor });
  };

  const toggleFavorite = (contactId: string) => {
    setContacts(prev => prev.map(c =>
      c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  const favorites = contacts.filter(c => c.isFavorite);
  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.chaveValor.includes(searchText)
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Contatos Delta</Text>
        <View style={{ width: 40 }} />
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
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceLight }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Buscar por CPF..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            keyboardType="numeric"
            maxLength={14}
          />
        </View>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.accent }]}
          onPress={handleSearchContact}
          disabled={searching}
          activeOpacity={0.7}
        >
          {searching ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Ionicons name="search" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Result */}
      {searchResult && (
        <View style={[styles.searchResultCard, { backgroundColor: colors.pixBg, borderColor: colors.accent + '30' }]}>
          <View style={[styles.contactAvatar, { backgroundColor: searchResult.color }]}>
            <Text style={styles.contactInitial}>{searchResult.initial}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: colors.textPrimary }]}>{searchResult.name}</Text>
            <Text style={[styles.contactDetail, { color: colors.textSecondary }]}>CPF: {searchResult.chaveValor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
              <Text style={[styles.verifiedText, { color: colors.accent }]}>Conta verificada no Delta Bank</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.accent }]} onPress={() => handleAddContact(searchResult)} activeOpacity={0.7}>
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Favorites */}
        {favorites.length > 0 && !searchText && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={14} color={colors.textMuted} />
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>FAVORITOS</Text>
            </View>
            <View style={styles.favoritesRow}>
              {favorites.map((contact) => (
                <TouchableOpacity key={contact.id} style={styles.favoriteItem} onPress={() => handleContactPress(contact)} activeOpacity={0.7}>
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
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <TouchableOpacity key={contact.id} style={[styles.contactItem, { borderBottomColor: colors.menuDivider }]} onPress={() => handleContactPress(contact)} activeOpacity={0.7}>
                <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                  <Text style={styles.contactInitial}>{contact.initial}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.textPrimary }]}>{contact.name}</Text>
                  <Text style={[styles.contactDetail, { color: colors.textSecondary }]}>{contact.chaveTipo}: {contact.chaveValor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(contact.id)} hitSlop={8} style={styles.favBtn}>
                  <Ionicons name={contact.isFavorite ? 'star' : 'star-outline'} size={18} color={contact.isFavorite ? '#F97316' : colors.textMuted} />
                </TouchableOpacity>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContacts}>
              <MaterialCommunityIcons name="account-search-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Busque por CPF para adicionar contatos
              </Text>
            </View>
          )}
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
  headerTitle: { fontSize: FontSizes.xxl, fontWeight: '700', flex: 1, textAlign: 'center' },
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
  searchRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg,
    paddingHorizontal: Spacing.lg, height: 46,
  },
  searchIcon: { marginRight: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSizes.md },
  searchBtn: {
    width: 46, height: 46,
    borderRadius: BorderRadii.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  searchResultCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.lg,
    padding: Spacing.lg, borderRadius: BorderRadii.lg,
    borderWidth: 1,
  },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 },
  verifiedText: { fontSize: FontSizes.xs, fontWeight: '500' },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
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
  favBtn: { padding: Spacing.xs, marginRight: Spacing.xs },
  emptyContacts: {
    alignItems: 'center', paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xxl,
  },
  emptyText: { fontSize: FontSizes.md, textAlign: 'center', marginTop: Spacing.md, lineHeight: 22 },
});
