import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalUserData, loginAPI, getSaldo, createAccount } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const SESSION_KEY = 'delta_bank_session';
const BIOMETRIC_CPF_KEY = 'delta_bank_biometric_cpf';
const BIOMETRIC_ENABLED_KEY = 'delta_bank_biometric_enabled';

interface AuthContextType {
  isLoggedIn: boolean;
  userData: LocalUserData | null;
  loading: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  register: (nome: string, cpf: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  tryBiometricLogin: () => Promise<boolean>;
  isBiometricAvailable: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUserData: async () => {},
  tryBiometricLogin: async () => false,
  isBiometricAvailable: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<LocalUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // On mount, try to restore session if biometric is enabled
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if biometric is available on device
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const biometricAvailable = hasHardware && isEnrolled;
        setIsBiometricAvailable(biometricAvailable);

        // Check if biometric login is enabled and there's a stored session
        const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        const storedSession = await AsyncStorage.getItem(SESSION_KEY);
        const storedCpf = await AsyncStorage.getItem(BIOMETRIC_CPF_KEY);

        if (biometricEnabled === 'true' && storedSession && storedCpf && biometricAvailable) {
          // Session exists and biometric is enabled - will try biometric login on LoginPage
          // For now, just mark that we have a session to restore
          setLoading(false);
          return;
        }

        // No biometric session to restore
        setLoading(false);
      } catch (e) {
        console.error('Auth initialization error:', e);
        setLoading(false);
      }
    };
    initializeAuth();
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
    if (!cpf || cpf.length < 11) {
      throw new Error('CPF inválido. Deve conter 11 dígitos.');
    }
    if (!senha || senha.length < 4) {
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
      // Store CPF for biometric login
      await AsyncStorage.setItem(BIOMETRIC_CPF_KEY, cpf);
    } else {
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
        await AsyncStorage.setItem(BIOMETRIC_CPF_KEY, cpf);
      } else {
        throw new Error('Login realizado, mas não foi possível carregar seus dados.');
      }
    }
  };

  const register = async (nome: string, cpf: string, senha: string) => {
    if (!nome || nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres.');
    }
    if (!cpf || cpf.length < 11) {
      throw new Error('CPF inválido. Deve conter 11 dígitos.');
    }
    if (!senha || senha.length < 4) {
      throw new Error('Senha deve ter pelo menos 4 caracteres.');
    }

    const res = await createAccount(nome.trim(), cpf, senha, 0);

    if (!res.sucesso) {
      const msg = res.mensagem || 'Erro ao criar conta';
      if (msg.includes('CPF já cadastrado') || msg.includes('já existe')) {
        throw new Error('Este CPF já está cadastrado. Tente fazer login.');
      }
      if (msg.includes('CPF inválido')) {
        throw new Error('CPF inválido. Verifique os dígitos e tente novamente.');
      }
      throw new Error(msg);
    }

    // Registration succeeded — redirect to login instead of auto-login
    // This ensures the user always goes through the login flow for security
    try {
      await login(cpf, senha);
    } catch (loginError: any) {
      console.warn('Auto-login falhou após registro:', loginError.message);
      throw new Error('Conta criada com sucesso! Faça login para continuar.');
    }
  };

  const tryBiometricLogin = async (): Promise<boolean> => {
    try {
      await LocalAuthentication.cancelAuthenticate().catch(() => {});
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return false;
      }

      // Check if biometric is enabled
      const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      if (biometricEnabled !== 'true') {
        return false;
      }

      // Check if there's a stored session
      const storedSession = await AsyncStorage.getItem(SESSION_KEY);
      if (!storedSession) {
        return false;
      }

      // Prompt biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para acessar o Delta Bank',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        // Restore session from storage
        const parsed = JSON.parse(storedSession) as LocalUserData;
        setUserData(parsed);
        setIsLoggedIn(true);
        // Refresh user data from server
        if (parsed.cpf) {
          refreshWithCpf(parsed.cpf);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  const logout = async () => {
    setUserData(null);
    setIsLoggedIn(false);
    const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    if (biometricEnabled !== 'true') {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, loading, login, register, logout, refreshUserData, tryBiometricLogin, isBiometricAvailable }}
    >
      {children}
    </AuthContext.Provider>
  );
};
