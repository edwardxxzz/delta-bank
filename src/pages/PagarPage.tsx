import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { makePix, brlToCents, centsToBRL, formatBRL } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

interface PagarPageProps {
  navigation?: any;
}

export const PagarPage: React.FC<PagarPageProps> = ({ navigation }) => {
  const { userData, refreshUserData } = useAuth();
  const [chavePix, setChavePix] = useState('');
  const [loading, setLoading] = useState(false);

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagar com Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>Escaneie ou digite a chave</Text>

          {/* QR Scanner Placeholder */}
          <View style={styles.qrScannerArea}>
            <View style={styles.qrFrame}>
              <View style={[styles.qrCorner, styles.qrCornerTL]} />
              <View style={[styles.qrCorner, styles.qrCornerTR]} />
              <View style={[styles.qrCorner, styles.qrCornerBL]} />
              <View style={[styles.qrCorner, styles.qrCornerBR]} />
            </View>
            <View style={styles.qrContent}>
              <MaterialCommunityIcons name="qrcode-scan" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.qrText}>Aponte a câmera para o QR Code</Text>
              <Text style={styles.qrSubtext}>(Funcionalidade de câmera disponível em dispositivos móveis)</Text>
            </View>
          </View>

          {/* Or type key */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou digite a chave</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputHint}>CPF, CNPJ, e-mail ou chave aleatória</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="key-variant" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite a chave Pix"
                placeholderTextColor={Colors.textMuted}
                value={chavePix}
                onChangeText={setChavePix}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, !chavePix && styles.continueBtnDisabled]}
            onPress={() => {
              if (chavePix) {
                navigation?.navigate('Transferir', { chaveDestino: chavePix });
              }
            }}
            disabled={!chavePix}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 40 },
  subtitle: {
    fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.lg,
  },
  qrScannerArea: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadii.xl,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  qrFrame: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  qrCorner: {
    position: 'absolute', width: 30, height: 30, borderColor: Colors.accent, borderWidth: 3,
  },
  qrCornerTL: { top: 20, left: 20, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
  qrCornerTR: { top: 20, right: 20, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
  qrCornerBL: { bottom: 20, left: 20, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
  qrCornerBR: { bottom: 20, right: 20, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },
  qrContent: { alignItems: 'center' },
  qrText: { color: 'rgba(255,255,255,0.6)', fontSize: FontSizes.md, marginTop: Spacing.md },
  qrSubtext: { color: 'rgba(255,255,255,0.4)', fontSize: FontSizes.xs, marginTop: Spacing.xs },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSizes.sm, color: Colors.textMuted, marginHorizontal: Spacing.md },
  inputSection: { marginBottom: Spacing.xl },
  inputHint: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: BorderRadii.lg, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: FontSizes.lg, color: Colors.textPrimary },
  continueBtn: {
    flexDirection: 'row', backgroundColor: Colors.accent, borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    elevation: 3, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  continueBtnDisabled: { backgroundColor: Colors.surfaceHover },
  continueText: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
});
