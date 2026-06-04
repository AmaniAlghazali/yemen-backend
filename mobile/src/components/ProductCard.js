import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';

const CARD_IMG_HEIGHT = Dimensions.get('window').width < 380 ? 140 : 180;
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currency';

function getImageUrl(product) {
  if (!product.images) return null;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[0];
    return img?.url || null;
  }
  if (typeof product.images === 'object' && product.images.url) {
    return product.images.url;
  }
  return null;
}

export default function ProductCard({ product, onPress }) {
  const { store } = useStore();
  const imageUrl = getImageUrl(product);
  const isLimited = product.stock < 5;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(product.id)}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'relative' }}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: CARD_IMG_HEIGHT }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: CARD_IMG_HEIGHT,
              backgroundColor: '#f3f4f6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>No Image</Text>
          </View>
        )}
        {isLimited && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#ef4444',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Limited</Text>
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: '#f3f4f6',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 11, color: '#6b7280' }}>{product.category}</Text>
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text
          style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}
          numberOfLines={1}
        >
          {product.title}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#059669' }}>
          {formatPrice(product.price, store.currency)}
        </Text>
        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
          Stock: {product.stock}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
