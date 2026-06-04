import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/v1/users/profile');
      setProfile(data.user || data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const userData = profile || user;
  const avatarUrl = userData?.profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.email || 'user'}`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: '#059669', padding: 32, alignItems: 'center' }}>
        <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' }} />
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 12 }}>{userData?.name}</Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500', textTransform: 'uppercase' }}>{userData?.role}</Text>
        </View>
      </View>

      <View style={{ padding: 16, paddingBottom: 60 }}>
        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Orders', value: userData?._count?.orders || 0, color: '#2563eb' },
            { label: 'Products', value: userData?._count?.products || 0, color: '#7c3aed' },
            { label: 'Reviews', value: userData?._count?.reviews || 0, color: '#f59e0b' },
            { label: 'Cart', value: userData?._count?.carts || 0, color: '#059669' },
          ].map((stat, i) => (
            <View key={i} style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
              alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
            }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Account Info */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Account Info</Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>Email</Text>
            <Text style={{ color: '#111827', fontSize: 16 }}>{userData?.email}</Text>
          </View>
          <View>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>Member Since</Text>
            <Text style={{ color: '#111827', fontSize: 16 }}>
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <TouchableOpacity
          onPress={() => navigation.navigate('UpdateProfile')}
          style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: '#111827' }}>Edit Profile</Text>
          <Text style={{ color: '#9ca3af' }}>→</Text>
        </TouchableOpacity>

        {userData?.role === 'admin' && (
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminDashboard')}
              style={{
                backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: '#7c3aed' }}>System Settings</Text>
              <Text style={{ color: '#9ca3af' }}>→</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 16,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: '#ef4444' }}>Sign Out</Text>
          <Text style={{ color: '#ef4444' }}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
