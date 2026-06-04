import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import { StoreProvider } from './src/context/StoreContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
//npx expo start
export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
