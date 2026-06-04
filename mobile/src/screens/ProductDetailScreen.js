import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currency';
import LoadingSpinner from '../components/LoadingSpinner';

function getImageUrl(product) {
  if (!product.images) return null;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[0];
    return img?.url || null;
  }
  if (typeof product.images === 'object' && product.images.url) return product.images.url;
  if (typeof product.images === 'string') return product.images;
  return null;
}

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { store } = useStore();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/api/v1/products/product-detail/${productId}`);
      setProduct(data.product);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    setAdding(true);
    try {
      const imageUrl = getImageUrl(product);
      await addToCart(product.id, product.title, product.price, imageUrl, qty);
      alert('Added to cart!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Product not found</Text></View>;

  const imageUrl = getImageUrl(product);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} showsVerticalScrollIndicator={false}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 300 }} resizeMode="cover" />
      ) : (
        <View style={{ width: '100%', height: 300, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#9ca3af' }}>No Image</Text>
        </View>
      )}

      <View style={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {product.category && (
            <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#1d4ed8', fontSize: 12, fontWeight: '500' }}>{product.category}</Text>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 }}>{product.title}</Text>

        <Text style={{ fontSize: 28, fontWeight: '700', color: '#059669', marginBottom: 16 }}>
          {formatPrice(product.price, store.currency)}
        </Text>

        <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24, marginBottom: 16 }}>
          {product.description || 'No description available.'}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#6b7280' }}>
            Stock: {product.stock > 0 ? product.stock : 'Out of stock'}
          </Text>
          {product.ratings > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
              <Text style={{ color: '#f59e0b', fontSize: 16 }}>★</Text>
              <Text style={{ color: '#374151', marginLeft: 4 }}>{product.ratings}</Text>
              {product.numOfReviews > 0 && (
                <Text style={{ color: '#9ca3af', marginLeft: 4 }}>({product.numOfReviews} reviews)</Text>
              )}
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', marginRight: 16 }}>Quantity:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setQty(Math.max(1, qty - 1))}
              style={{ width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 20, fontWeight: '600' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', marginHorizontal: 20 }}>{qty}</Text>
            <TouchableOpacity
              onPress={() => setQty(Math.min(product.stock, qty + 1))}
              style={{ width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 20, fontWeight: '600' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={adding || product.stock === 0}
          style={{
            backgroundColor: product.stock === 0 ? '#9ca3af' : '#059669',
            borderRadius: 12, padding: 16, alignItems: 'center',
            opacity: adding ? 0.6 : 1,
          }}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Reviews</Text>
            {product.reviews.map((review, i) => (
              <View key={review.id || i} style={{
                backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '600', color: '#111827' }}>{review.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#f59e0b', fontSize: 14 }}>★</Text>
                    <Text style={{ color: '#374151', marginLeft: 4, fontSize: 14 }}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 14, lineHeight: 20 }}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
