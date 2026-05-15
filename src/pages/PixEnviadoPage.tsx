import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface PixEnviadoPageProps {
  navigation?: any;
  route?: any;
}

// Mascara CPF/CNPJ: mostra apenas os últimos 2 dígitos, resto vira asterisco
// Ex: 123.456.789-00 → ***.***.***-00
// Para chaves não-CPF, mascarar parcialmente (mostrar primeiros 2 e últimos 2)
const maskSensitiveKey = (key: string, tipo: string): string => {
  if (!key) return '';

  // Remove formatação para pegar dígitos
  const digits = key.replace(/\D/g, '');

  if (tipo === 'CPF' && digits.length >= 11) {
    // CPF: ***.***.***-XX
    const lastTwo = digits.slice(-2);
    return `***.***.***-${lastTwo}`;
  }

  if (tipo === 'CNPJ' && digits.length >= 14) {
    const lastTwo = digits.slice(-2);
    return `***.***.***/****-${lastTwo}`;
  }

  if (tipo === 'TELEFONE') {
    // Telefone: **-*****-**XX
    const clean = key.replace(/\D/g, '');
    if (clean.length >= 10) {
      const lastTwo = clean.slice(-2);
      return `(**) *****-${lastTwo}`;
    }
    // Fallback: mascarar parcial
    if (key.length > 4) {
      return key.slice(0, 2) + '*'.repeat(key.length - 4) + key.slice(-2);
    }
  }

  if (tipo === 'EMAIL') {
    // Email: mostrar primeira letra + ***@***.com
    const atIdx = key.indexOf('@');
    if (atIdx > 0) {
      const first = key.charAt(0);
      const domain = key.slice(atIdx + 1);
      const dotIdx = domain.lastIndexOf('.');
      const ext = dotIdx >= 0 ? domain.slice(dotIdx) : '';
      return `${first}***@***${ext}`;
    }
  }

  // Chave aleatória ou outros: mostrar primeiros 4 e últimos 4, resto asterisco
  if (key.length > 8) {
    return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
  }

  // Se for curta demais, mascarar parcialmente
  if (key.length > 2) {
    return '*'.repeat(key.length - 2) + key.slice(-2);
  }

  return key;
};

export const PixEnviadoPage: React.FC<PixEnviadoPageProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const {
    nomeDest = 'Destinatário',
    chavePix = '',
    valor = '0,00',
    tipoChave = 'CPF',
  } = route?.params || {};

  // Aplica máscara na chave Pix exibida
  const maskedKey = maskSensitiveKey(chavePix, tipoChave);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Success animation area */}
      <View style={styles.successArea}>
        <View style={[styles.successCircle, { backgroundColor: colors.accent + '20' }]}>
          <View style={[styles.successInnerCircle, { backgroundColor: colors.accent }]}>
            <Ionicons name="checkmark" size={48} color={colors.white} />
          </View>
        </View>
        <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Pix enviado!</Text>
        <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
          Sua transferência foi realizada com sucesso
        </Text>
      </View>

      {/* Transaction details card */}
      <View style={[styles.detailsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.amountRow, { borderBottomColor: colors.menuDivider }]}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Valor enviado</Text>
          <Text style={[styles.amountValue, { color: colors.accent }]}>R$ {valor}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Destinatário</Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{nomeDest}</Text>
        </View>

        <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Chave</Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{maskedKey}</Text>
        </View>

        <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tipo de chave</Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{tipoChave}</Text>
        </View>

        <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
            <Text style={[styles.statusText, { color: colors.accent }]}>Concluído</Text>
          </View>
        </View>

        <View style={[styles.detailDivider, { backgroundColor: colors.menuDivider }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Data</Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {new Date().toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Delta Bank badge */}
      <View style={styles.badgeRow}>
        <View style={[styles.badgeIcon, { backgroundColor: colors.accent }]}>
          <MaterialCommunityIcons name="shield-check" size={16} color={colors.white} />
        </View>
        <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
          Transação segura Delta Bank
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigation?.navigate('Main', { screen: 'home' })}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={20} color={colors.white} />
          <Text style={styles.primaryBtnText}>Voltar ao início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => navigation?.navigate('Extrato')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.accent} />
          <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>Ver extrato</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.xxl },
  successArea: {
    alignItems: 'center',
    paddingTop: Spacing.huge + Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  successCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successInnerCircle: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  successTitle: {
    fontSize: FontSizes.huge, fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: FontSizes.md, textAlign: 'center',
  },
  detailsCard: {
    borderRadius: BorderRadii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  amountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: Spacing.lg, borderBottomWidth: 1, marginBottom: Spacing.md,
  },
  amountLabel: { fontSize: FontSizes.md },
  amountValue: { fontSize: FontSizes.giant, fontWeight: '700' },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  detailLabel: { fontSize: FontSizes.md },
  detailValue: { fontSize: FontSizes.md, fontWeight: '600', flex: 1, textAlign: 'right' },
  detailDivider: { height: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  statusText: { fontSize: FontSizes.md, fontWeight: '600' },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginBottom: Spacing.xxl,
  },
  badgeIcon: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: FontSizes.sm },
  actions: { gap: Spacing.md },
  primaryBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: FontSizes.xxl, fontWeight: '700' },
});
