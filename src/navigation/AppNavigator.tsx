import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomePage } from '../pages/HomePage';
import { CardsPage } from '../pages/CardsPage';
import { InvestPage } from '../pages/InvestPage';
import { MorePage } from '../pages/MorePage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ExtratoPage } from '../pages/ExtratoPage';
import { DepositarPage } from '../pages/DepositarPage';
import { SacarPage } from '../pages/SacarPage';
import { PagarPage } from '../pages/PagarPage';
import { ReceberPage } from '../pages/ReceberPage';
import { QRCodePage } from '../pages/QRCodePage';
import { TransferirPage } from '../pages/TransferirPage';
import { DeltaContactsPage } from '../pages/DeltaContactsPage';
import { ChavesPixPage } from '../pages/ChavesPixPage';
import { PixEnviadoPage } from '../pages/PixEnviadoPage';
import { ContaPage } from '../pages/ContaPage';
import { ConfigPage } from '../pages/ConfigPage';
import { BottomNav } from '../components/BottomNav';
import { ActionMenu } from '../components/ActionMenu';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab navigator wrapper - center button opens ActionMenu
function MainTabsWrapper({ navigation }: any) {
  const [showActionMenu, setShowActionMenu] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <BottomNav
            activeTab={props.state.routes[props.state.index].name}
            onTabPress={(tab) => {
              const index = props.state.routes.findIndex((r) => r.name === tab);
              if (index >= 0) props.navigation.navigate(tab);
            }}
            onCentralPress={() => setShowActionMenu(true)}
          />
        )}
      >
        <Tab.Screen name="home" component={HomePage} />
        <Tab.Screen name="cards" component={CardsPage} />
        <Tab.Screen name="invest" component={InvestPage} />
        <Tab.Screen name="more" component={MorePage} />
      </Tab.Navigator>

      <ActionMenu
        visible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onPagar={() => { setShowActionMenu(false); navigation.navigate('Pagar'); }}
        onTransferir={() => { setShowActionMenu(false); navigation.navigate('Transferir'); }}
        onDepositar={() => { setShowActionMenu(false); navigation.navigate('Depositar'); }}
        onReceber={() => { setShowActionMenu(false); navigation.navigate('Receber'); }}
      />
    </>
  );
}

const AppStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabsWrapper} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="Extrato" component={ExtratoPage} />
      <Stack.Screen name="Depositar" component={DepositarPage} />
      <Stack.Screen name="Sacar" component={SacarPage} />
      <Stack.Screen name="Pagar" component={PagarPage} />
      <Stack.Screen name="Receber" component={ReceberPage} />
      <Stack.Screen name="QRCode" component={QRCodePage} />
      <Stack.Screen name="Transferir" component={TransferirPage} />
      <Stack.Screen name="DeltaContacts" component={DeltaContactsPage} />
      <Stack.Screen name="ChavesPix" component={ChavesPixPage} />
      <Stack.Screen name="PixEnviado" component={PixEnviadoPage} />
      <Stack.Screen name="Conta" component={ContaPage} />
      <Stack.Screen name="Config" component={ConfigPage} />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <LoginPage />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
