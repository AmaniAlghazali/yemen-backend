import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function AboutScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ backgroundColor: '#059669', padding: 48, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>EST. 2026</Text>
        <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff', marginTop: 8, textAlign: 'center' }}>
          Quality Meets Riyadh
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 24, backgroundColor: '#f9fafb' }}>
        {[
          { number: '5,000+', label: 'Products' },
          { number: '10K+', label: 'Happy Customers' },
          { number: '24h', label: 'Delivery' },
        ].map((stat, i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#059669' }}>{stat.number}</Text>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ padding: 24, paddingBottom: 60 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
          Why Shop With Us?
        </Text>
        {[
          { title: 'Quality First', desc: 'We source only the finest products from trusted suppliers across Yemen and the region.' },
          { title: 'Local Speed', desc: 'Fast delivery across Riyadh and all major cities in Saudi Arabia.' },
          { title: '24/7 Support', desc: 'Our dedicated support team is here to help you anytime, day or night.' },
        ].map((feature, i) => (
          <View
            key={i}
            style={{
              backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 }}>{feature.title}</Text>
            <Text style={{ color: '#6b7280', lineHeight: 20 }}>{feature.desc}</Text>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate('Contact')}
          style={{
            backgroundColor: '#059669', borderRadius: 12, padding: 16,
            alignItems: 'center', marginTop: 16,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Get In Touch</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
