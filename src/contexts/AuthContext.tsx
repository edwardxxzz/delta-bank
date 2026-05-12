import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalUserData, loginAPI, getSaldo, createAccount } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'delta_bank_session';

interface AuthContextType {
  isLoggedIn: boolean;
  userData: LocalUserData | null;
  loading: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  register: (nome: string, cpf: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<LocalUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (stored) {
          const session: LocalUserData = JSON.parse(stored);
          setUserData(session);
          setIsLoggedIn(true);
          // Refresh balance from API
          await refreshWithCpf(session.cpf);
        }
      } catch (e) {
        console.error('Session restore error:', e);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const refreshWithCpf = async (cpf: string) => {
    try {
      const res = await getSaldo(cpf);
      if (res.sucesso && res.dados) {
        const updated: LocalUserData = {
          cpf: res.dados.Conta.cpf,
          nome: res.dados.Conta.nome,
          saldo_centavos: res.dados.Conta.saldo_centavos,
          limite_diario: res.dados.Conta.limite_diario,
        };
        setUserData(updated);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const refreshUserData = async () => {
    if (userData?.cpf) {
      await refreshWithCpf(userData.cpf);
    }
  };

  const login = async (cpf: string, senha: string) => {
    const res = await loginAPI(cpf, senha);
    if (!res.sucesso) {
      throw new Error(res.mensagem || 'Erro no login');
    }
    if (res.dados) {
      const user: LocalUserData = {
        cpf: res.dados.cpf,
        nome: res.dados.nome,
        saldo_centavos: res.dados.saldo_centavos,
        limite_diario: res.dados.limite_diario,
      };
      setUserData(user);
      setIsLoggedIn(true);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  };

  const register = async (nome: string, cpf: string, senha: string) => {
    const res = await createAccount(nome, cpf, senha, 0);
    if (!res.sucesso) {
      throw new Error(res.mensagem || 'Erro ao criar conta');
    }
    // Auto-login after registration
    await login(cpf, senha);
  };

  const logout = async () => {
    setUserData(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, loading, login, register, logout, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
