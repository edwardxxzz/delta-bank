import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomePage } from '../pages/HomePage';
import { CardsPage } from '../pages/CardsPage';
import { InvestPage } from '../pages/InvestPage';
import { MorePage } from '../pages/MorePage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { PixPage } from '../pages/PixPage';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <BottomNav
          activeTab={props.state.routes[props.state.index].name}
          onTabPress={(tab) => {
            const index = props.state.routes.findIndex((r) => r.name === tab);
            if (index >= 0) props.navigation.navigate(tab);
          }}
          onCentralPress={() => props.navigation.navigate('home')}
        />
      )}
    >
      <Tab.Screen name="home" component={HomePage} />
      <Tab.Screen name="cards" component={CardsPage} />
      <Tab.Screen name="invest" component={InvestPage} />
      <Tab.Screen name="more" component={MorePage} />
    </Tab.Navigator>
  );
};

const AppStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="Pix" component={PixPage} />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
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
    backgroundColor: '#F5F5F5',
  },
});
