import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface QRCodePageProps {
  navigation?: any;
}

export const QRCodePage: React.FC<QRCodePageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '---';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pix Delta Bank - ${userData?.nome || ''}\nChave: ${formattedCPF}${valor ? `\nValor: R$ ${valor}` : ''}${descricao ? `\n${descricao}` : ''}`,
      });
    } catch (e) {}
  };

  const handleCopyKey = () => {
    Alert.alert('Chave copiada!', `CPF: ${formattedCPF}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Cobrar com Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gere um QR Code para receber</Text>

        {/* QR Code Display */}
        <View style={[styles.qrCodeContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.qrCodeBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="qrcode" size={180} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{userData?.nome || 'Usuário'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{formattedCPF}</Text>
        </View>

        {/* Value Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Valor (opcional)</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.currencyPrefix, { color: colors.accent }]}>R$</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Descrição (opcional)</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Ex: Churrasco de sábado"
              placeholderTextColor={colors.textMuted}
              value={descricao}
              onChangeText={setDescricao}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.copyBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onPress={handleCopyKey} activeOpacity={0.7}>
            <Feather name="copy" size={18} color={colors.textSecondary} />
            <Text style={[styles.copyText, { color: colors.textSecondary }]}>Copiar chave</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.accent }]} onPress={handleShare} activeOpacity={0.7}>
            <Feather name="share-2" size={18} color={colors.white} />
            <Text style={styles.shareText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
  subtitle: { fontSize: FontSizes.md, marginBottom: Spacing.xl },
  qrCodeContainer: {
    alignItems: 'center',
    borderRadius: BorderRadii.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  qrCodeBox: {
    width: 220,
    height: 220,
    borderRadius: BorderRadii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: Spacing.lg,
  },
  userName: { fontSize: FontSizes.xxl, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: FontSizes.md },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.md, fontWeight: '600', marginBottom: Spacing.sm },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg, borderWidth: 1,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  currencyPrefix: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700' },
  input: { flex: 1, fontSize: FontSizes.lg },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadii.lg,
    height: 54,
    borderWidth: 1,
  },
  copyText: { fontSize: FontSizes.md, fontWeight: '600' },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadii.lg,
    height: 54,
  },
  shareText: { fontSize: FontSizes.md, fontWeight: '600', color: '#FFFFFF' },
});
