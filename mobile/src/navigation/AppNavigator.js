import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Home, ShoppingCart, Info, Phone, User } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UpdateProfileScreen from '../screens/UpdateProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ViewAllOrdersScreen from '../screens/admin/ViewAllOrdersScreen';
import ViewAllProductScreen from '../screens/admin/ViewAllProductScreen';
import UserAdminScreen from '../screens/admin/UserAdminScreen';
import AdminSettingScreen from '../screens/admin/AdminSettingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const defaultHeader = {
  headerStyle: { backgroundColor: '#059669' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' },
};

function TabIcon({ routeName, color, size }) {
  const icons = {
    Home: Home,
    Cart: ShoppingCart,
    About: Info,
    Contact: Phone,
    Profile: User,
  };
  const IconComponent = icons[routeName];
  if (!IconComponent) return null;
  return <IconComponent color={color} size={size || 22} />;
}

function MainTabs() {
  const { cartCount } = useCart();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => <TabIcon routeName={route.name} color={color} size={size} />,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { height: 62, paddingTop: 4, paddingBottom: 6 },
        tabBarItemStyle: { paddingHorizontal: 2 },
        tabBarIconStyle: { marginBottom: -1 },
        tabBarLabel: ({ focused, color, children }) => (
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 10, fontWeight: '500', color, textAlign: 'center' }}>
            {children}
          </Text>
        ),
        ...defaultHeader,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'Yemen Marketplace' }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }}
      />
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthScreens() {
  return (
    <Stack.Navigator screenOptions={{ ...defaultHeader, headerBackTitleVisible: false }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ ...defaultHeader, title: 'Product Details' }} />
    </Stack.Navigator>
  );
}

function AuthenticatedScreens() {
  const { isAdmin } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ ...defaultHeader, headerBackTitleVisible: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ title: 'Update Profile' }} />
      {isAdmin && (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
          <Stack.Screen name="ViewAllOrders" component={ViewAllOrdersScreen} options={{ title: 'Orders' }} />
          <Stack.Screen name="ViewAllProduct" component={ViewAllProductScreen} options={{ title: 'Products' }} />
          <Stack.Screen name="UserAdmin" component={UserAdminScreen} options={{ title: 'Users' }} />
          <Stack.Screen name="AdminSetting" component={AdminSettingScreen} options={{ title: 'Settings' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreens />;
  }

  return <AuthenticatedScreens />;
}
