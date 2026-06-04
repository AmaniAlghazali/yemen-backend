import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
  TextInput, Image, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import api from '../../api/axios';
import { formatPrice } from '../../utils/currency';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Food', 'Books', 'Home & Kitchen', 'Beauty',
  'Sports', 'Automotive', 'Toys & Games', 'Health', 'Pet Supplies',
  'Office Supplies', 'Baby & Kids', 'Jewelry', 'Music', 'Arts & Crafts',
  'Garden', 'Tools', 'Shoes', 'Bags & Luggage', 'Furniture', 'Groceries',
  'Phones & Tablets', 'Computers & Laptops', 'Cameras', 'Smart Home', 'Stationery',
];

export default function AdminDashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({ title: '', description: '', price: '', stock: '1', category: '' });
  const [productImage, setProductImage] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [combineRes, ordersRes] = await Promise.all([
        api.get('/api/v1/users/combine-data'),
        api.get('/api/v1/orders/all-orders'),
      ]);
      setData(combineRes.data);
      setOrders(ordersRes.data.orders || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const deleteOrder = async (orderId) => {
    try {
      await api.delete(`/api/v1/orders/delete-order/${orderId}`);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Cannot delete order');
    }
  };

  const pickProductImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true,
    });
    if (!result.canceled && result.assets?.[0]) setProductImage(result.assets[0].base64);
  };

  const handleCreateProduct = async () => {
    if (!productForm.title || !productForm.price || !productForm.category) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Title, price and category are required' });
      return;
    }
    setSavingProduct(true);
    try {
      const payload = {
        title: productForm.title, description: productForm.description,
        price: parseFloat(productForm.price), stock: parseInt(productForm.stock || '1'),
        category: productForm.category,
      };
      if (productImage) payload.image = `data:image/jpeg;base64,${productImage}`;
      await api.post('/api/v1/products/create-product', payload);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Product created successfully!' });
      setShowAddProduct(false);
      setProductForm({ title: '', description: '', price: '', stock: '1', category: '' });
      setProductImage(null);
      fetchData();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to create product' });
    } finally {
      setSavingProduct(false);
    }
  };

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 16, paddingBottom: 60 }}>
        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Revenue', value: formatPrice(data?.totalRevenue || 0), color: '#059669', screen: null },
            { label: 'Orders', value: `${data?.totalOrders || 0}`, color: '#2563eb', screen: 'ViewAllOrders' },
            { label: 'Products', value: `${data?.totalProducts || 0}`, color: '#7c3aed', screen: 'ViewAllProduct' },
            { label: 'Users', value: `${data?.totalUsers || 0}`, color: '#dc2626', screen: 'UserAdmin' },
          ].map((stat, i) => (
            <TouchableOpacity
              key={i}
              disabled={!stat.screen}
              onPress={() => stat.screen && navigation.navigate(stat.screen)}
              style={{
                width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
                shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
              }}
            >
              <Text style={{ fontSize: 13, color: '#6b7280' }}>{stat.label}</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: stat.color, marginTop: 4 }}>{stat.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Status Overview */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Order Status Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ViewAllOrders')}>
              <Text style={{ color: '#059669', fontSize: 13, fontWeight: '500' }}>View All →</Text>
            </TouchableOpacity>
          </View>
          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <View key={status} style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
              borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
            }}>
              <View style={{
                flex: 1, height: 8, borderRadius: 4,
                backgroundColor: '#f3f4f6', overflow: 'hidden',
                marginRight: 12,
              }}>
                <View style={{
                  width: `${Math.min(100, (statusCounts[status] || 0) / Math.max(1, orders.length) * 100)}%`,
                  height: '100%',
                  backgroundColor: status === 'Delivered' ? '#059669' : status === 'Cancelled' ? '#ef4444' : status === 'Shipped' ? '#2563eb' : status === 'Processing' ? '#f59e0b' : '#9ca3af',
                  borderRadius: 4,
                }} />
              </View>
              <Text style={{ fontSize: 13, color: '#374151', width: 80 }}>{status}</Text>
              <Text style={{ fontWeight: '600', color: '#111827', width: 30, textAlign: 'right' }}>{statusCounts[status] || 0}</Text>
            </View>
          ))}
        </View>

        {/* Stock Alerts */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Stock Alerts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ViewAllProduct')}>
              <Text style={{ color: '#059669', fontSize: 13, fontWeight: '500' }}>Manage →</Text>
            </TouchableOpacity>
          </View>
          {[
            { label: 'Out of Stock', value: data?.outOfStock || 0, color: '#ef4444' },
            { label: 'Low Stock', value: data?.lowStock || 0, color: '#f59e0b' },
            { label: 'In Stock', value: data?.inStock || 0, color: '#059669' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: '#f3f4f6' }}>
              <Text style={{ color: '#374151' }}>{item.label}</Text>
              <Text style={{ fontWeight: '600', color: item.color }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>Recent Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ViewAllOrders')}>
                <Text style={{ color: '#059669', fontSize: 13, fontWeight: '500' }}>View All →</Text>
              </TouchableOpacity>
            </View>
            {orders.slice(0, 5).map((order) => (
              <View
                key={order.id}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '500', color: '#111827' }} numberOfLines={1}>
                    Order #{order.id.slice(0, 8)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>
                    {formatPrice(order.totalPrice)}
                  </Text>
                </View>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
                  backgroundColor: order.orderStatus === 'Delivered' ? '#d1fae5' : order.orderStatus === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: order.orderStatus === 'Delivered' ? '#059669' : order.orderStatus === 'Cancelled' ? '#ef4444' : '#d97706',
                  }}>
                    {order.orderStatus}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowAddProduct(true)}
            style={{ width: '47%', backgroundColor: '#059669', borderRadius: 12, padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Add Product</Text>
          </TouchableOpacity>
          {[
            { label: 'View Orders', screen: 'ViewAllOrders', color: '#2563eb' },
            { label: 'Manage Users', screen: 'UserAdmin', color: '#7c3aed' },
            { label: 'Settings', screen: 'AdminSetting', color: '#dc2626' },
          ].map((btn, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(btn.screen)}
              style={{
                width: '47%', backgroundColor: btn.color, borderRadius: 12,
                padding: 16, alignItems: 'center', marginBottom: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Back to Store */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={{
            backgroundColor: '#fff', borderRadius: 12, padding: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: '#e5e7eb',
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🏪</Text>
          <Text style={{ color: '#059669', fontWeight: '600', fontSize: 15 }}>Back to Store</Text>
        </TouchableOpacity>
      </View>

      {/* Add Product Modal */}
      <Modal visible={showAddProduct} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <ScrollView style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>Add New Product</Text>

            <TouchableOpacity onPress={pickProductImage} style={{ alignItems: 'center', marginBottom: 16 }}>
              {productImage ? (
                <Image source={{ uri: `data:image/jpeg;base64,${productImage}` }} style={{ width: '100%', height: 150, borderRadius: 12 }} resizeMode="cover" />
              ) : (
                <View style={{ width: '100%', height: 150, borderRadius: 12, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#9ca3af' }}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={mlabel}>Title *</Text>
            <TextInput
              value={productForm.title} onChangeText={(t) => setProductForm((p) => ({ ...p, title: t }))}
              placeholder="Product title" placeholderTextColor="#9ca3af" style={minput}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={mlabel}>Price *</Text>
                <TextInput
                  value={productForm.price} onChangeText={(t) => setProductForm((p) => ({ ...p, price: t }))}
                  placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor="#9ca3af" style={minput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={mlabel}>Stock</Text>
                <TextInput
                  value={productForm.stock} onChangeText={(t) => setProductForm((p) => ({ ...p, stock: t }))}
                  placeholder="1" keyboardType="number-pad" placeholderTextColor="#9ca3af" style={minput}
                />
              </View>
            </View>

            <Text style={mlabel}>Category *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat} onPress={() => setProductForm((p) => ({ ...p, category: cat }))}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                    backgroundColor: productForm.category === cat ? '#059669' : '#f3f4f6',
                  }}
                >
                  <Text style={{ color: productForm.category === cat ? '#fff' : '#374151', fontSize: 13 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={mlabel}>Description</Text>
            <TextInput
              value={productForm.description} onChangeText={(t) => setProductForm((p) => ({ ...p, description: t }))}
              placeholder="Product description" placeholderTextColor="#9ca3af"
              multiline numberOfLines={3} style={{ ...minput, height: 80, textAlignVertical: 'top' }}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 32 }}>
              <TouchableOpacity
                onPress={() => { setShowAddProduct(false); setProductImage(null); }}
                style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateProduct} disabled={savingProduct}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center', opacity: savingProduct ? 0.6 : 1 }}
              >
                {savingProduct ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Create</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const mlabel = { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 8 };
const minput = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
  padding: 10, fontSize: 14, marginBottom: 4, backgroundColor: '#f9fafb',
};
