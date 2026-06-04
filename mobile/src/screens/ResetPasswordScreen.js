import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView,
} from 'react-native';
import api from '../api/axios';
import PasswordStrength from '../components/PasswordStrength';

export default function ResetPasswordScreen({ route, navigation }) {
  const { token } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const isValid = passwordsMatch && newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword);

  const handleReset = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.post(`/api/v1/users/reset-password/${token}`, {
        password: newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 28, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Invalid or Expired Link</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          This reset link is invalid or has expired.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Request New Link</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 28, marginBottom: 16 }}>✅</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Password Reset!</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          Your password has been successfully updated.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Sign In Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Set New Password</Text>
        <Text style={{ color: '#6b7280', marginBottom: 24 }}>Enter your new password below</Text>

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>New Password</Text>
        <TextInput
          value={newPassword} onChangeText={setNewPassword}
          placeholder="New password" secureTextEntry
          style={{
            borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
            padding: 14, fontSize: 16, marginBottom: 4, backgroundColor: '#f9fafb',
          }}
        />
        <PasswordStrength password={newPassword} />

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 8 }}>
          Confirm Password
        </Text>
        <TextInput
          value={confirmPassword} onChangeText={setConfirmPassword}
          placeholder="Confirm password" secureTextEntry
          style={{
            borderWidth: 1, borderColor: !passwordsMatch && confirmPassword ? '#ef4444' : '#d1d5db',
            borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 4, backgroundColor: '#f9fafb',
          }}
        />
        {!passwordsMatch && confirmPassword ? (
          <Text style={{ color: '#ef4444', fontSize: 13 }}>Passwords do not match</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading || !isValid}
          style={{
            backgroundColor: '#059669', borderRadius: 12, padding: 16,
            alignItems: 'center', marginTop: 24, opacity: loading || !isValid ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
  );
}
