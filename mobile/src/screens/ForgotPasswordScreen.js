import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../api/axios';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/api/v1/users/reset-password-request', { email });
      setSent(true);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to send reset link' });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 28, marginBottom: 16 }}>✉️</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Check Your Email</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          We've sent a password reset link to {email}
        </Text>
        <TouchableOpacity
          onPress={() => { setSent(false); setEmail(''); }}
          style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, paddingHorizontal: 32, marginBottom: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Try Another Email</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: '#059669' }}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Forgot Password?</Text>
        <Text style={{ color: '#6b7280', marginBottom: 24 }}>
          Enter your email and we'll send you a reset link
        </Text>

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Email</Text>
        <TextInput
          value={email} onChangeText={setEmail}
          placeholder="Enter your email" placeholderTextColor="#9ca3af"
          keyboardType="email-address" autoCapitalize="none"
          style={{
            borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
            padding: 14, fontSize: 16, marginBottom: 24, backgroundColor: '#f9fafb',
          }}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: '#059669', borderRadius: 12, padding: 16,
            alignItems: 'center', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: '#059669' }}>Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}
