import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

export default function MapView({ initialRegion, style, children, onPress }) {
  const pos = initialRegion || { latitude: 24.7136, longitude: 46.6753 };
  const mapUrl = `https://www.openstreetmap.org/?mlat=${pos.latitude}&mlon=${pos.longitude}&zoom=15`;

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(mapUrl)}
      style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb', borderRadius: 16 }]}
    >
      <Text style={{ fontSize: 32 }}>🗺️</Text>
      <Text style={{ color: '#374151', fontWeight: '600', marginTop: 8 }}>
        {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}
      </Text>
      <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
        Tap to open in maps
      </Text>
    </TouchableOpacity>
  );
}

export function Marker() {
  return null;
}
