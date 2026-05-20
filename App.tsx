import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { BiometricProvider } from './src/contexts/BiometricContext';
import { VisibilityProvider } from './src/contexts/VisibilityContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppContent() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <BiometricProvider>
            <VisibilityProvider>
              <AppContent />
            </VisibilityProvider>
          </BiometricProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
