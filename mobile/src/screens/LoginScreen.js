import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Image, ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!email) { setAvatarUrl(null); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const encoded = encodeURIComponent(email);
        const { data } = await api.get(`/api/v1/users/get-photo/${encoded}`);
        if (data?.url) setAvatarUrl(data.url);
      } catch {
        setAvatarUrl(null);
      }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [email]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: e.response?.data?.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Image
            source={{
              uri: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'default'}`,
            }}
            style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#f3f4f6', marginBottom: 16 }}
          />
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>Welcome Back</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>Sign in to your account</Text>
        </View>

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
            padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb',
          }}
        />

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Password</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            style={{
              borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
              padding: 14, fontSize: 16, backgroundColor: '#f9fafb', paddingRight: 50,
            }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 14, top: 14 }}
          >
            <Text style={{ color: '#059669', fontWeight: '600' }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
          <Text style={{ color: '#059669', fontSize: 14 }}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: '#059669', borderRadius: 12, padding: 16,
            alignItems: 'center', marginTop: 24, opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>
            Don't have an account? <Text style={{ color: '#059669', fontWeight: '600' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
  );
}
