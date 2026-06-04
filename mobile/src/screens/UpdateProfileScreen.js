import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PasswordStrength from '../components/PasswordStrength';

export default function UpdateProfileScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [avatar, setAvatar] = useState(null);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  const passwordsMatch = newPass === confirmNewPass;

  const handleUpdateProfile = async () => {
    if (!oldPassword) { alert('Current password is required'); return; }
    setLoading(true);
    try {
      const payload = { name, email, oldPassword };
      if (avatar) payload.avatar = `data:image/jpeg;base64,${avatar}`;
      await api.put('/api/v1/users/update-profile', payload);
      await refreshProfile();
      alert('Profile updated successfully');
      navigation.goBack();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordsMatch) { alert('Passwords do not match'); return; }
    if (newPass.length < 8) { alert('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/api/v1/users/update-password', {
        oldPassword: oldPass,
        newPassword: newPass,
        confirmNewPassword: confirmNewPass,
      });
      alert('Password updated successfully');
      setOldPass(''); setNewPass(''); setConfirmNewPass('');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setAvatar(result.assets[0].base64);
    }
  };

  const avatarUrl = avatar
    ? `data:image/jpeg;base64,${avatar}`
    : (user?.profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
          {['profile', 'security'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: 12, alignItems: 'center',
                backgroundColor: activeTab === tab ? '#059669' : '#fff',
              }}
            >
              <Text style={{ color: activeTab === tab ? '#fff' : '#374151', fontWeight: '600' }}>
                {tab === 'profile' ? 'Profile' : 'Security'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'profile' ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
            <TouchableOpacity onPress={pickAvatar} style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image source={{ uri: avatarUrl }} style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: '#f3f4f6' }} />
              <Text style={{ color: '#059669', marginTop: 8, fontWeight: '500' }}>Change Avatar</Text>
            </TouchableOpacity>

            <Text style={labelStyle}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={inputStyle} />

            <Text style={labelStyle}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={inputStyle} />

            <Text style={labelStyle}>Current Password (required to save)</Text>
            <TextInput value={oldPassword} onChangeText={setOldPassword} secureTextEntry style={inputStyle} />

            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={loading}
              style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
            <Text style={labelStyle}>Current Password</Text>
            <TextInput value={oldPass} onChangeText={setOldPass} secureTextEntry style={inputStyle} />

            <Text style={labelStyle}>New Password</Text>
            <TextInput value={newPass} onChangeText={setNewPass} secureTextEntry style={inputStyle} />
            <PasswordStrength password={newPass} />

            <Text style={labelStyle}>Confirm New Password</Text>
            <TextInput value={confirmNewPass} onChangeText={setConfirmNewPass} secureTextEntry style={inputStyle} />
            {!passwordsMatch && confirmNewPass ? (
              <Text style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>Passwords do not match</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleUpdatePassword}
              disabled={loading}
              style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
  );
}

const labelStyle = { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 12 };
const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
  padding: 12, fontSize: 16, backgroundColor: '#f9fafb', marginBottom: 4,
};
