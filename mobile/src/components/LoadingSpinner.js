import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <ActivityIndicator size="large" color="#059669" />
      <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>{message}</Text>
    </View>
  );
}
