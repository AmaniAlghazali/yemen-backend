import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import MapView, { Marker } from '../components/MapView';
import api from '../api/axios';

export default function ContactScreen() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Order Inquiry', message: '' });
  const [position, setPosition] = useState({ latitude: 24.7136, longitude: 46.6753 });
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please fill in all required fields' });
      return;
    }
    setSending(true);
    try {
      await api.post('/api/v1/users/contact', {
        ...form,
        lat: position.latitude,
        lng: position.longitude,
      });
      Toast.show({ type: 'success', text1: 'Sent!', text2: 'Your message has been sent successfully.' });
      setForm({ name: '', email: '', subject: 'Order Inquiry', message: '' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to send message' });
    } finally {
      setSending(false);
    }
  };

  const handleMapPress = (e) => {
    if (e && e.nativeEvent && e.nativeEvent.coordinate) {
      setPosition(e.nativeEvent.coordinate);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 }}>Contact Us</Text>
        <Text style={{ color: '#6b7280', marginBottom: 20 }}>We'd love to hear from you</Text>

        <View style={{ height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 24.7136,
              longitude: 46.6753,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={position} />
          </MapView>
        </View>

        {/* Contact Info Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>📍</Text>
            <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>Digital City, Riyadh, Saudi Arabia</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>📞</Text>
            <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>+966 50 000 0000</Text>
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>Sun-Thu, 9am-5pm</Text>
          </View>
        </View>

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>Name *</Text>
        <TextInput
          value={form.name} onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
          placeholder="Your name" placeholderTextColor="#9ca3af" style={inputStyle}
        />

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>Email *</Text>
        <TextInput
          value={form.email} onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
          placeholder="Your email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" style={inputStyle}
        />

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>Subject</Text>
        <TextInput
          value={form.subject} onChangeText={(t) => setForm((p) => ({ ...p, subject: t }))}
          placeholder="Subject" placeholderTextColor="#9ca3af" style={inputStyle}
        />

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>Message *</Text>
        <TextInput
          value={form.message} onChangeText={(t) => setForm((p) => ({ ...p, message: t }))}
          placeholder="Your message" multiline numberOfLines={4} placeholderTextColor="#9ca3af"
          style={{ ...inputStyle, height: 100, textAlignVertical: 'top' }}
        />

        <TouchableOpacity
          onPress={handleSubmit} disabled={sending}
          style={{
            backgroundColor: '#059669', borderRadius: 12, padding: 16,
            alignItems: 'center', marginTop: 8, opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Send Message</Text>}
        </TouchableOpacity>
      </ScrollView>
  );
}

const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
  padding: 12, fontSize: 16, marginBottom: 12, backgroundColor: '#fff',
};
