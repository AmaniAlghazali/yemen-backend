import React from 'react';
import { View, Text } from 'react-native';

const checks = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
];

export default function PasswordStrength({ password }) {
  return (
    <View style={{ marginTop: 8, marginBottom: 8 }}>
      {checks.map((c, i) => {
        const met = c.test(password);
        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{
              width: 18, height: 18, borderRadius: 9,
              backgroundColor: met ? '#059669' : '#e5e7eb',
              justifyContent: 'center', alignItems: 'center',
              marginRight: 8,
            }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                {met ? '✓' : '×'}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: met ? '#059669' : '#9ca3af' }}>
              {c.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
