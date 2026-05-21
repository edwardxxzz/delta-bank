import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const BIOMETRIC_ENABLED_KEY = 'delta_bank_biometric_enabled';

interface BiometricContextType {
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  hasHardware: boolean;
  isEnrolled: boolean;
  authenticate: (reason?: string) => Promise<boolean>;
}

const BiometricContext = createContext<BiometricContextType>({
  biometricEnabled: false,
  setBiometricEnabled: async () => {},
  hasHardware: false,
  isEnrolled: false,
  authenticate: async () => false,
});

export const useBiometric = () => useContext(BiometricContext);

export const BiometricProvider = ({ children }: { children: ReactNode }) => {
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const authenticatingRef = useRef(false);

  // Check device biometric capabilities on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasHardware(compatible);
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error('Biometric check error:', error);
        setHasHardware(false);
        setIsEnrolled(false);
      }
    };
    checkBiometrics();
  }, []);

  // Load saved preference
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        if (stored !== null) {
          setBiometricEnabledState(stored === 'true');
        }
      } catch (e) {
        console.error('Biometric preference load error:', e);
      }
    };
    loadPreference();
  }, []);

  const setBiometricEnabled = async (enabled: boolean) => {
    if (enabled) {
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Aviso', 'Seu dispositivo não possui biometria cadastrada nas configurações.');
        return;
      }

      // IMPORTANTE: Atraso de 200ms para evitar o bug de 'app_cancel' do Android 
      // causado pela mudança de layout (ActivityIndicator carregando)
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirme sua identidade para ativar a biometria',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: true,
        });

        if (!result.success) {
          return;
        }
      } catch (error) {
        console.error('Biometric activation error:', error);
        return;
      }
    }

    setBiometricEnabledState(enabled);
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
    } catch (e) {
      console.error('Biometric preference save error:', e);
    }
  };

  const authenticate = async (reason?: string): Promise<boolean> => {
    if (authenticatingRef.current) {
      return false;
    }

    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasHardware(compatible);
    setIsEnrolled(enrolled);

    if (!compatible || !enrolled) {
      Alert.alert('Aviso', 'Seu dispositivo não possui biometria cadastrada ou configurada.');
      return false;
    }

    // IMPORTANTE: Atraso de 200ms para evitar o bug de 'app_cancel' do Android 
    // causado pela mudança de layout (ActivityIndicator carregando)
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      authenticatingRef.current = true;
      await LocalAuthentication.cancelAuthenticate().catch(() => {});
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Autentique-se para continuar',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: true,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    } finally {
      authenticatingRef.current = false;
    }
  };

  return (
    <BiometricContext.Provider
      value={{ biometricEnabled, setBiometricEnabled, hasHardware, isEnrolled, authenticate }}
    >
      {children}
    </BiometricContext.Provider>
  );
};
