import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, TextInput,
  ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currency';
import api from '../api/axios';

const DEFAULT_METHODS = [
  { id: 'credit_card', name: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard & more' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
];

export default function CartScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { cartItems, loading, fetchCart, updateQuantity, removeItem } = useCart();
  const { store } = useStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_METHODS);
  const [shippingInfo, setShippingInfo] = useState({
    address: '', city: '', country: '', zipCode: '', mobileNo: '',
  });

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/api/v1/payments/methods').then((res) => {
      if (res.data.success) {
        const enabled = res.data.methods.filter((m) => m.enabled);
        if (enabled.length) setPaymentMethods(enabled);
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const taxRate = store.taxRate || 0;
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.country || !shippingInfo.zipCode || !shippingInfo.mobileNo) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please fill all shipping fields' });
      return;
    }
    setCheckingOut(true);
    try {
      const orderPayload = {
        shippingInfo: {
          address: shippingInfo.address,
          mobileNo: shippingInfo.mobileNo.replace(/[^0-9]/g, ""),
          city: shippingInfo.city,
          country: shippingInfo.country,
          zipCode: shippingInfo.zipCode.replace(/[^0-9]/g, ""),
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '',
        })),
        paymentMethod,
        taxPrice: tax,
        shippingCost: 0,
        totalPrice: total,
        orderStatus: 'Processing',
      };

      if (paymentMethod === 'cod') {
        orderPayload.paymentId = `cod_${Date.now()}`;
        orderPayload.paymentStatus = 'pending';
        await api.post('/api/v1/orders/create-order', orderPayload);
        Toast.show({ type: 'success', text1: 'Order Placed!', text2: 'Pay on delivery.' });
        setShowCheckout(false);
        fetchCart();
        return;
      }

      orderPayload.paymentId = `pending_${Date.now()}`;
      orderPayload.paymentStatus = 'pending';
      const orderRes = await api.post('/api/v1/orders/create-order', orderPayload);
      const orderId = orderRes.data.order.id;

      if (paymentMethod === 'credit_card') {
        Toast.show({ type: 'info', text1: 'Card Payment', text2: 'Complete payment to confirm order' });
        const sessionRes = await api.post('/api/v1/payments/create-session', {
          paymentMethod: 'credit_card',
          amount: total,
          currency: (store.currency || 'USD').toLowerCase(),
          orderId,
          items: cartItems.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
          shippingInfo: shippingInfo,
        });
        if (sessionRes.data.success && sessionRes.data.clientSecret) {
          Toast.show({ type: 'success', text1: 'Redirecting...', text2: 'Complete payment in browser' });
        }
        return;
      }

      if (paymentMethod === 'paypal' || paymentMethod === 'tabby' || paymentMethod === 'tamara') {
        const sessionRes = await api.post('/api/v1/payments/create-session', {
          paymentMethod,
          amount: total,
          currency: store.currency || 'USD',
          orderId,
          items: cartItems.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
          shippingInfo: shippingInfo,
        });
        if (sessionRes.data.success && sessionRes.data.checkoutUrl) {
          Toast.show({ type: 'info', text1: 'Redirecting...', text2: 'Complete payment in browser' });
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: `${paymentMethod} is not configured` });
        }
        return;
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to place order' });
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>Sign in to view your cart</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{ backgroundColor: '#059669', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>Your cart is empty</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{ backgroundColor: '#059669', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1, padding: 16, paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <View
            key={item.productId || item.id}
            style={{
              backgroundColor: '#fff', borderRadius: 16, padding: 12,
              marginBottom: 12, flexDirection: 'row',
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
            }}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 12 }} />
            ) : (
              <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontSize: 12 }}>No img</Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }} numberOfLines={1}>{item.title}</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669', marginTop: 4 }}>
                {formatPrice(item.price, store.currency)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  style={{ width: 32, height: 32, backgroundColor: '#f3f4f6', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>-</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 12, fontSize: 16, fontWeight: '600' }}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                  style={{ width: 32, height: 32, backgroundColor: '#f3f4f6', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeItem(item.productId)}
                  style={{ marginLeft: 'auto' }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ backgroundColor: '#fff', padding: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: '#6b7280' }}>Subtotal</Text>
          <Text style={{ fontWeight: '500' }}>{formatPrice(subtotal, store.currency)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: '#6b7280' }}>Shipping</Text>
          <Text style={{ fontWeight: '500' }}>Free</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: '#6b7280' }}>VAT ({taxRate}%)</Text>
          <Text style={{ fontWeight: '500' }}>{formatPrice(tax, store.currency)}</Text>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Total</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#059669' }}>{formatPrice(total, store.currency)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCheckout(true)}
          style={{ backgroundColor: '#059669', borderRadius: 12, padding: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCheckout} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 20 }}>Checkout</Text>

                {['address', 'city', 'country', 'zipCode', 'mobileNo'].map((field) => (
                  <View key={field}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 8 }}>
                      {field === 'mobileNo' ? 'Mobile No' : field.charAt(0).toUpperCase() + field.slice(1)}
                    </Text>
                    <TextInput
                      value={shippingInfo[field]}
                      onChangeText={(text) => setShippingInfo((prev) => ({ ...prev, [field]: text }))}
                      placeholder={`Enter ${field === 'mobileNo' ? 'mobile number' : field}`}
                      keyboardType={field === 'mobileNo' || field === 'zipCode' ? 'numeric' : 'default'}
                      style={{
                        borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
                        padding: 12, fontSize: 16, backgroundColor: '#f9fafb',
                      }}
                    />
                  </View>
                ))}

                <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 }}>Payment Method</Text>
                {paymentMethods.map((pm) => (
                  <TouchableOpacity
                    key={pm.id}
                    onPress={() => setPaymentMethod(pm.id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', padding: 12,
                      borderRadius: 12, borderWidth: 1, marginBottom: 8,
                      borderColor: paymentMethod === pm.id ? '#059669' : '#e5e7eb',
                      backgroundColor: paymentMethod === pm.id ? '#f0fdf4' : '#fff',
                    }}
                  >
                    <View style={{
                      width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                      borderColor: paymentMethod === pm.id ? '#059669' : '#d1d5db',
                      justifyContent: 'center', alignItems: 'center', marginRight: 12,
                    }}>
                      {paymentMethod === pm.id && (
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#059669' }} />
                      )}
                    </View>
                    <Text style={{ fontSize: 18, marginRight: 8 }}>{pm.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', fontSize: 14 }}>{pm.name}</Text>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>{pm.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>Total</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>{formatPrice(total, store.currency)}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 16 }}>
                  <TouchableOpacity
                    onPress={() => setShowCheckout(false)}
                    style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' }}
                  >
                    <Text style={{ fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePlaceOrder}
                    disabled={checkingOut}
                    style={{
                      flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#059669',
                      alignItems: 'center', opacity: checkingOut ? 0.6 : 1,
                    }}
                  >
                    {checkingOut ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Place Order</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
