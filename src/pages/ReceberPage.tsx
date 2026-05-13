import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, formatBRL } from '../services/apiService';

interface ReceberPageProps {
  navigation?: any;
}

export const ReceberPage: React.FC<ReceberPageProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '---';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Receber Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* QR Code Card */}
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => navigation?.navigate('QRCode')}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.pagarBg }]}>
            <MaterialCommunityIcons name="qrcode" size={32} color={colors.pagarIcon} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>QR Code</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>Gere um código para receber</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Chave Pix Card */}
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => {
            Alert.alert('Chave Pix', `Sua chave Pix (CPF): ${formattedCPF}`);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.pagarBg }]}>
            <MaterialCommunityIcons name="key-variant" size={32} color={colors.pagarIcon} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Chave Pix</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>Compartilhe sua chave Pix</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Dados Bancários Card */}
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => {
            Alert.alert('Dados bancários', 'Agência: 0001\nConta: 12345-6\nBanco: Delta Bank');
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.pixBg }]}>
            <Ionicons name="business-outline" size={32} color={colors.accent} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Dados bancários</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>Copie agência e conta</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>
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
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginBottom: 4 },
  optionSub: { fontSize: FontSizes.md },
});
