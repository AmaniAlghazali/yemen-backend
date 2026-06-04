import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Switch,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import api from '../../api/axios';
import PasswordStrength from '../../components/PasswordStrength';

export default function AdminSettingScreen() {
  const { user, refreshProfile } = useAuth();
  const { store, updateStoreSettings } = useStore();

  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currPassword, setCurrPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [storeName, setStoreName] = useState(store?.storeName || '');
  const [currency, setCurrency] = useState(store?.currency || 'SAR');
  const [taxRate, setTaxRate] = useState(String(store?.taxRate || 0));
  const [maintenanceMode, setMaintenanceMode] = useState(store?.maintenanceMode || false);
  const [storeLoading, setStoreLoading] = useState(false);

  const passwordsMatch = newPass === confirmNewPass;

  const handleUpdateProfile = async () => {
    if (!currPassword) { alert('Current password is required'); return; }
    setProfileLoading(true);
    try {
      await api.put('/api/v1/users/update-profile', { name, email, oldPassword: currPassword });
      await refreshProfile();
      alert('Profile updated');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordsMatch) { alert('Passwords do not match'); return; }
    setPassLoading(true);
    try {
      await api.post('/api/v1/users/update-password', {
        oldPassword: oldPass, newPassword: newPass, confirmNewPassword: confirmNewPass,
      });
      alert('Password updated');
      setOldPass(''); setNewPass(''); setConfirmNewPass('');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpdateStore = async () => {
    setStoreLoading(true);
    try {
      await updateStoreSettings({
        storeName, currency, taxRate: parseFloat(taxRate), maintenanceMode,
      });
      alert('Store settings updated');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update store settings');
    } finally {
      setStoreLoading(false);
    }
  };

  const CURRENCIES = ['USD', 'YER', 'EUR', 'SAR', 'AED'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
          {['profile', 'security', 'store'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: 12, alignItems: 'center',
                backgroundColor: activeTab === tab ? '#059669' : '#fff',
              }}
            >
              <Text style={{ color: activeTab === tab ? '#fff' : '#374151', fontWeight: '600', fontSize: 13 }}>
                {tab === 'profile' ? 'Profile' : tab === 'security' ? 'Security' : 'Store'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'profile' && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
            <Text style={labelStyle}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={inputStyle} />
            <Text style={labelStyle}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={inputStyle} />
            <Text style={labelStyle}>Current Password (required)</Text>
            <TextInput value={currPassword} onChangeText={setCurrPassword} secureTextEntry style={inputStyle} />
            <TouchableOpacity
              onPress={handleUpdateProfile} disabled={profileLoading}
              style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, opacity: profileLoading ? 0.6 : 1 }}
            >
              {profileLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save Profile</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'security' && (
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
              onPress={handleUpdatePassword} disabled={passLoading}
              style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, opacity: passLoading ? 0.6 : 1 }}
            >
              {passLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'store' && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
            <Text style={labelStyle}>Store Name</Text>
            <TextInput value={storeName} onChangeText={setStoreName} style={inputStyle} />

            <Text style={labelStyle}>Currency</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c} onPress={() => setCurrency(c)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                    backgroundColor: currency === c ? '#059669' : '#f3f4f6',
                  }}
                >
                  <Text style={{ color: currency === c ? '#fff' : '#374151', fontWeight: '500' }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={labelStyle}>Tax Rate (%)</Text>
            <TextInput
              value={taxRate} onChangeText={setTaxRate}
              keyboardType="decimal-pad"
              style={inputStyle}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 16, color: '#374151' }}>Maintenance Mode</Text>
              <Switch
                value={maintenanceMode}
                onValueChange={setMaintenanceMode}
                trackColor={{ false: '#e5e7eb', true: '#059669' }}
              />
            </View>

            <TouchableOpacity
              onPress={handleUpdateStore} disabled={storeLoading}
              style={{ backgroundColor: '#059669', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20, opacity: storeLoading ? 0.6 : 1 }}
            >
              {storeLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save Store Settings</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
  );
}

const labelStyle = { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 8 };
const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
  padding: 12, fontSize: 16, backgroundColor: '#f9fafb', marginBottom: 4,
};
