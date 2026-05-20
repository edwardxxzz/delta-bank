import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VISIBILITY_KEY = 'delta_bank_balance_visible';

interface VisibilityContextType {
  balanceVisible: boolean;
  setBalanceVisible: (visible: boolean) => void;
  toggleBalanceVisible: () => void;
}

const VisibilityContext = createContext<VisibilityContextType>({
  balanceVisible: true,
  setBalanceVisible: () => {},
  toggleBalanceVisible: () => {},
});

export const useVisibility = () => useContext(VisibilityContext);

export const VisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [balanceVisible, setBalanceVisibleState] = useState(true);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(VISIBILITY_KEY);
        if (stored !== null) {
          setBalanceVisibleState(stored === 'true');
        }
      } catch (e) {
        console.error('Visibility preference load error:', e);
      }
    };
    loadPreference();
  }, []);

  const setBalanceVisible = async (visible: boolean) => {
    setBalanceVisibleState(visible);
    try {
      await AsyncStorage.setItem(VISIBILITY_KEY, String(visible));
    } catch (e) {
      console.error('Visibility preference save error:', e);
    }
  };

  const toggleBalanceVisible = () => {
    setBalanceVisible(!balanceVisible);
  };

  return (
    <VisibilityContext.Provider value={{ balanceVisible, setBalanceVisible, toggleBalanceVisible }}>
      {children}
    </VisibilityContext.Provider>
  );
};
