import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { makePix, brlToCents } from '../services/apiService';

interface PixPageProps {
  navigation?: any;
}

export const PixPage: React.FC<PixPageProps> = ({ navigation }) => {
  const { userData, refreshUserData } = useAuth();
  const [cpfDestino, setCpfDestino] = useState('');
  const [valor, setValor] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const getRawCPF = (formatted: string) => formatted.replace(/\D/g, '');

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSendPix = async () => {
    const rawCPF = getRawCPF(cpfDestino);
    if (!rawCPF || !valor || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const valorBRL = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorBRL) || valorBRL <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }

    if (!userData?.cpf) {
      Alert.alert('Erro', 'Sessão inválida');
      return;
    }

    setLoading(true);
    try {
      const valorCentavos = brlToCents(valorBRL);
      const res = await makePix(userData.cpf, rawCPF, valorCentavos, senha);
      if (res.sucesso) {
        Alert.alert('Sucesso', `Pix de R$ ${valorBRL.toFixed(2)} enviado com sucesso!`);
        setCpfDestino('');
        setValor('');
        setSenha('');
        await refreshUserData();
        navigation?.goBack?.();
      } else {
        Alert.alert('Erro', res.mensagem || 'Falha ao enviar Pix');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enviar Pix</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💎</Text>
            <Text style={styles.infoTitle}>Transferência instantânea</Text>
            <Text style={styles.infoSubtitle}>
              Envie dinheiro para qualquer conta usando a chave Pix (CPF)
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chave Pix (CPF)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🪪</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor={Colors.textMuted}
                  value={cpfDestino}
                  onChangeText={(text) => setCpfDestino(formatCPF(text))}
                  keyboardType="numeric"
                  maxLength={14}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>R$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  placeholderTextColor={Colors.textMuted}
                  value={valor}
                  onChangeText={(text) => setValor(formatCurrency(text))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sua senha</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor={Colors.textMuted}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendPix}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.sendIcon}>↗️</Text>
                <Text style={styles.sendText}>Enviar Pix</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: Colors.white, fontSize: 24, fontWeight: '700' },
  headerTitle: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
  content: { flex: 1 },
  scrollContent: { padding: Spacing.xxl, paddingBottom: 60 },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadii.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoIcon: { fontSize: 40, marginBottom: Spacing.md },
  infoTitle: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  infoSubtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center' },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.sm },
  label: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputIcon: { marginRight: Spacing.md, fontSize: 16, fontWeight: '700', color: Colors.primary },
  input: { flex: 1, fontSize: FontSizes.lg, color: Colors.textPrimary },
  sendButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadii.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
    elevation: 3,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sendIcon: { fontSize: 20 },
  sendText: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '700' },
});
