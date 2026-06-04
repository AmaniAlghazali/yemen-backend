import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

export default function SignUpScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setAvatar(result.assets[0].base64);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    try {
      const payload = { name, email, password };
      if (avatar) payload.avatar = `data:image/jpeg;base64,${avatar}`;
      await register(payload);
      Toast.show({ type: 'success', text1: 'Welcome!', text2: 'Account created successfully.' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: e.response?.data?.message || 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>Create Account</Text>
          <Text style={{ color: '#6b7280', marginTop: 4 }}>Join Yemen Marketplace</Text>
        </View>

        <TouchableOpacity onPress={pickAvatar} style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image
            source={{
              uri: avatar ? `data:image/jpeg;base64,${avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || 'default'}`,
            }}
            style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#f3f4f6' }}
          />
          <Text style={{ color: '#059669', marginTop: 8, fontWeight: '500' }}>Add Avatar</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Name</Text>
        <TextInput
          value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#9ca3af"
          style={inputStyle}
        />

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Email</Text>
        <TextInput
          value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#9ca3af"
          keyboardType="email-address" autoCapitalize="none"
          style={inputStyle}
        />

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 }}>Password</Text>
        <TextInput
          value={password} onChangeText={setPassword} placeholder="Create password" placeholderTextColor="#9ca3af"
          secureTextEntry style={inputStyle}
        />

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: '#059669', borderRadius: 12, padding: 16,
            alignItems: 'center', marginTop: 24, opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: '#6b7280' }}>
            Already have an account? <Text style={{ color: '#059669', fontWeight: '600' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
  );
}

const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
  padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb',
};
