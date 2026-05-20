import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    // If enabling, verify biometric works first
    if (enabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirme sua identidade para ativar a biometria',
          fallbackLabel: 'Usar senha',
          cancelLabel: 'Cancelar',
        });

        if (!result.success) {
          // User cancelled or failed - don't enable
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
    if (!hasHardware || !isEnrolled) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Autentique-se para continuar',
        fallbackLabel: 'Usar senha',
        cancelLabel: 'Cancelar',
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
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
