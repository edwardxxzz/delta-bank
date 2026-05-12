import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Header } from '../components/Header';
import { BalanceCard } from '../components/BalanceCard';
import { QuickActions } from '../components/QuickActions';
import { TransactionList } from '../components/TransactionList';
import { useAuth } from '../contexts/AuthContext';
import { centsToBRL, getExtrato } from '../services/apiService';

export interface DisplayTransaction {
  id: string;
  type: 'pix_received' | 'pix_sent' | 'deposit' | 'withdraw';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
}

interface HomePageProps {
  navigation?: any;
}

export const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const { userData, refreshUserData } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);

  const loadTransactions = useCallback(async () => {
    if (userData?.cpf) {
      try {
        const res = await getExtrato(userData.cpf);
        if (res.sucesso && res.dados && Array.isArray(res.dados)) {
          const mapped: DisplayTransaction[] = res.dados.map((t: any, idx: number) => ({
            id: String(idx + 1),
            type: t.tipo === 'pix_enviado' ? 'pix_sent' as const
              : t.tipo === 'pix_recebido' ? 'pix_received' as const
              : t.tipo === 'deposito' ? 'deposit' as const
              : 'withdraw' as const,
            title: t.tipo === 'pix_enviado' ? 'Pix enviado'
              : t.tipo === 'pix_recebido' ? 'Pix recebido'
              : t.tipo === 'deposito' ? 'Depósito'
              : 'Saque',
            subtitle: t.nome_destinatario || t.nome_remetente || 'Delta Bank',
            amount: t.tipo === 'pix_enviado' || t.tipo === 'saque'
              ? -centsToBRL(t.valor_centavos)
              : centsToBRL(t.valor_centavos),
            date: new Date(t.data_hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          }));
          setTransactions(mapped);
        }
      } catch (e) {
        console.error('Erro ao carregar extrato:', e);
      }
    }
  }, [userData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    await loadTransactions();
    setRefreshing(false);
  };

  const balance = userData ? centsToBRL(userData.saldo_centavos) : 0;
  const firstName = userData?.nome?.split(' ')[0] || 'Usuário';

  const displayTransactions: DisplayTransaction[] = transactions.length > 0 ? transactions : [
    { id: '1', type: 'pix_received', title: 'Pix recebido', subtitle: 'Maria Oliveira', amount: 850, date: 'Hoje, 10:30' },
    { id: '2', type: 'pix_sent', title: 'Pix enviado', subtitle: 'João da Silva', amount: -300, date: 'Hoje, 09:15' },
    { id: '3', type: 'deposit', title: 'Depósito', subtitle: 'Banco Brasil', amount: 200, date: 'Ontem, 16:45' },
    { id: '4', type: 'withdraw', title: 'Saque', subtitle: 'ATM 24h', amount: -50, date: 'Ontem, 14:20' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00C9A7" />}
      >
        <Header name={firstName} onProfilePress={() => navigation?.navigate?.('Profile')} />
        <BalanceCard balance={balance} monthlyChange={320.4} visible={balanceVisible} onToggleVisibility={() => setBalanceVisible(!balanceVisible)} onViewStatement={() => {}} />
        <QuickActions onPix={() => navigation?.navigate?.('Pix')} onPay={() => {}} onTransfer={() => {}} onLoan={() => {}} />
        <TransactionList transactions={displayTransactions} onViewAll={() => {}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { paddingBottom: 100 },
});
