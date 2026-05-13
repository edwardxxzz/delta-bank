import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, formatBRL } from '../services/apiService';

interface ReceberPageProps {
  navigation?: any;
}

export const ReceberPage: React.FC<ReceberPageProps> = ({ navigation }) => {
  const { userData } = useAuth();
  const formattedCPF = userData?.cpf
    ? userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : '---';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receber Pix</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* QR Code Card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation?.navigate('QRCode')}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#EEF2FF' }]}>
            <MaterialCommunityIcons name="qrcode" size={32} color={Colors.pagarIcon} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>QR Code</Text>
            <Text style={styles.optionSub}>Gere um código para receber</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Chave Pix Card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => {
            Alert.alert('Chave Pix', `Sua chave Pix (CPF): ${formattedCPF}`);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#EEF2FF' }]}>
            <MaterialCommunityIcons name="key-variant" size={32} color={Colors.pagarIcon} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Chave Pix</Text>
            <Text style={styles.optionSub}>Compartilhe sua chave Pix</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Dados Bancários Card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => {
            Alert.alert('Dados bancários', 'Agência: 0001\nConta: 12345-6\nBanco: Delta Bank');
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: Colors.pixBg }]}>
            <Ionicons name="business-outline" size={32} color={Colors.accent} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Dados bancários</Text>
            <Text style={styles.optionSub}>Copie agência e conta</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
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
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
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
  optionTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  optionSub: { fontSize: FontSizes.md, color: Colors.textSecondary },
});
