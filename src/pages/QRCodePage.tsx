import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface QRCodePageProps {
  navigation?: any;
}

export const QRCodePage: React.FC<QRCodePageProps> = ({ navigation }) => {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cobrar com Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>Gere um QR Code para receber</Text>

        {/* QR Code Display */}
        <View style={styles.qrCodeContainer}>
          <View style={styles.qrCodeBox}>
            <MaterialCommunityIcons name="qrcode" size={180} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{userData?.nome || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{formattedCPF}</Text>
        </View>

        {/* Value Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor (opcional)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={Colors.textMuted}
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex: Churrasco de sábado"
              placeholderTextColor={Colors.textMuted}
              value={descricao}
              onChangeText={setDescricao}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopyKey} activeOpacity={0.7}>
            <Feather name="copy" size={18} color={Colors.textSecondary} />
            <Text style={styles.copyText}>Copiar chave</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.7}>
            <Feather name="share-2" size={18} color={Colors.white} />
            <Text style={styles.shareText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadii.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrCodeBox: {
    width: 220,
    height: 220,
    backgroundColor: Colors.white,
    borderRadius: BorderRadii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  userName: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: FontSizes.md, color: Colors.textSecondary },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: BorderRadii.lg, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  currencyPrefix: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700', color: Colors.accent },
  input: { flex: 1, fontSize: FontSizes.lg, color: Colors.textPrimary },
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
    backgroundColor: Colors.white,
    borderRadius: BorderRadii.lg,
    height: 54,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copyText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadii.lg,
    height: 54,
  },
  shareText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
});
