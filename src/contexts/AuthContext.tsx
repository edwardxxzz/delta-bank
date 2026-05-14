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
    // Validate input
    if (!cpf || cpf.length < 11) {
      throw new Error('CPF inválido. Deve conter 11 dígitos.');
    }
    if (!senha || senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 4 caracteres.');
    }

    const res = await loginAPI(cpf, senha);

    if (!res.sucesso) {
      throw new Error(res.mensagem || 'CPF ou senha incorretos');
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
    } else {
      // Login succeeded but no data - try fetching balance separately
      const saldoRes = await getSaldo(cpf);
      if (saldoRes.sucesso && saldoRes.dados) {
        const user: LocalUserData = {
          cpf: saldoRes.dados.Conta.cpf,
          nome: saldoRes.dados.Conta.nome,
          saldo_centavos: saldoRes.dados.Conta.saldo_centavos,
          limite_diario: saldoRes.dados.Conta.limite_diario,
        };
        setUserData(user);
        setIsLoggedIn(true);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        throw new Error('Login realizado, mas não foi possível carregar seus dados.');
      }
    }
  };

  const register = async (nome: string, cpf: string, senha: string) => {
    // Validate input
    if (!nome || nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres.');
    }
    if (!cpf || cpf.length < 11) {
      throw new Error('CPF inválido. Deve conter 11 dígitos.');
    }
    if (!senha || senha.length < 4) {
      throw new Error('Senha deve ter pelo menos 4 caracteres.');
    }

    const res = await createAccount(nome.trim(), cpf, senha, 10);

    if (!res.sucesso) {
      // Provide clear error messages from backend
      const msg = res.mensagem || 'Erro ao criar conta';
      if (msg.includes('CPF já cadastrado') || msg.includes('já existe')) {
        throw new Error('Este CPF já está cadastrado. Tente fazer login.');
      }
      if (msg.includes('CPF inválido')) {
        throw new Error('CPF inválido. Verifique os dígitos e tente novamente.');
      }
      throw new Error(msg);
    }

    // Registration succeeded - now login automatically
    try {
      await login(cpf, senha);
    } catch (loginError: any) {
      // If auto-login fails after registration, still show success
      console.warn('Auto-login falhou após registro:', loginError.message);
      throw new Error('Conta criada com sucesso! Faça login manualmente.');
    }
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
