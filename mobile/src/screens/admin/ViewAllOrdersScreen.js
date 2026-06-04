import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Image,
  ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import api from '../../api/axios';
import { formatPrice } from '../../utils/currency';

export default function ViewAllOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    address: '', mobileNo: '', city: '', country: '', zipCode: '',
    productId: '', quantity: '1', taxPrice: '0', shippingCost: '0',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/api/v1/orders/all-orders'),
        api.get('/api/v1/products/get-all-products'),
      ]);
      setOrders(ordersRes.data.orders || []);
      setProducts(productsRes.data.products || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId, orderStatus) => {
    try {
      await api.put(`/api/v1/orders/update-order-status/${orderId}`, { orderStatus });
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await api.delete(`/api/v1/orders/delete-order/${orderId}`);
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || 'Cannot delete this order');
    }
  };

  const handleEditShipping = async () => {
    try {
      await api.put(`/api/v1/orders/update-order-element/${editingOrder.id}`, editForm);
      setEditingOrder(null);
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update order');
    }
  };

  const selectedProduct = products.find((p) => p.id === addForm.productId);

  const handleCreateOrder = async () => {
    if (!addForm.address || !addForm.city || !addForm.country || !addForm.zipCode || !addForm.mobileNo || !addForm.productId) {
      alert('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/v1/orders/create-order', {
        shippingInfo: {
          address: addForm.address,
          mobileNo: parseInt(addForm.mobileNo),
          city: addForm.city,
          country: addForm.country,
          zipCode: parseInt(addForm.zipCode),
        },
        items: [{
          productId: selectedProduct.id,
          name: selectedProduct.title,
          price: selectedProduct.price,
          quantity: parseInt(addForm.quantity),
          image: selectedProduct.images?.[0]?.url || '',
        }],
        paymentId: 'admin_order',
        paymentStatus: 'Pending',
        taxPrice: parseFloat(addForm.taxPrice || '0'),
        shippingCost: parseFloat(addForm.shippingCost || '0'),
        totalPrice: selectedProduct.price * parseInt(addForm.quantity) + parseFloat(addForm.taxPrice || '0') + parseFloat(addForm.shippingCost || '0'),
        orderStatus: 'Processing',
      });
      alert('Order created successfully!');
      setShowAddForm(false);
      setAddForm({ address: '', mobileNo: '', city: '', country: '', zipCode: '', productId: '', quantity: '1', taxPrice: '0', shippingCost: '0' });
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 16, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>All Orders ({orders.length})</Text>
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={{ backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add Order</Text>
          </TouchableOpacity>
        </View>

        {orders.map((order) => (
          <View key={order.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ fontWeight: '600', fontSize: 14, color: '#6b7280' }}>
                  Order #{order.id.slice(0, 8)}...
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                backgroundColor: order.orderStatus === 'Delivered' ? '#d1fae5' : order.orderStatus === 'Cancelled' ? '#fee2e2' : '#fef3c7',
              }}>
                <Text style={{
                  fontSize: 12, fontWeight: '500',
                  color: order.orderStatus === 'Delivered' ? '#059669' : order.orderStatus === 'Cancelled' ? '#ef4444' : '#d97706',
                }}>{order.orderStatus}</Text>
              </View>
            </View>

            {order.items?.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={{ width: 36, height: 36, borderRadius: 6, marginRight: 8 }} />
                ) : null}
                <Text style={{ flex: 1 }} numberOfLines={1}>{item.name} x{item.quantity}</Text>
                <Text style={{ fontWeight: '500' }}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}

            <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>Total</Text>
                <Text style={{ fontWeight: '700', color: '#059669' }}>{formatPrice(order.totalPrice)}</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => handleStatusUpdate(order.id, status)}
                    style={{
                      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                      backgroundColor: order.orderStatus === status ? '#059669' : '#f3f4f6',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: order.orderStatus === status ? '#fff' : '#374151' }}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => { setEditingOrder(order); setEditForm({ address: order.shippingAddress, city: order.shippingCity, country: order.shippingCountry, zipCode: String(order.shippingZipCode), mobileNo: String(order.shippingMobileNo), taxPrice: order.taxPrice, shippingCost: order.shippingCost, totalPrice: order.totalPrice }); }}
                style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 8, flex: 1, alignItems: 'center' }}
              >
                <Text style={{ color: '#2563eb', fontSize: 12 }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(order.id)}
                style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 8, flex: 1, alignItems: 'center' }}
              >
                <Text style={{ color: '#ef4444', fontSize: 12 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Add Order Modal */}
      <Modal visible={showAddForm} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <ScrollView style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 20 }}>Create Order</Text>

            <Text style={labelStyle}>Product</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {products.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setAddForm((prev) => ({ ...prev, productId: p.id }))}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                      backgroundColor: addForm.productId === p.id ? '#059669' : '#f3f4f6',
                    }}
                  >
                    <Text style={{ color: addForm.productId === p.id ? '#fff' : '#374151', fontSize: 13 }}>{p.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {selectedProduct && (
              <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ fontWeight: '600', color: '#059669' }}>{selectedProduct.title}</Text>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>Price: {formatPrice(selectedProduct.price)}</Text>
              </View>
            )}

            {['address', 'city', 'country', 'zipCode', 'mobileNo'].map((field) => (
              <View key={field}>
                <Text style={labelStyle}>{field === 'mobileNo' ? 'Mobile No' : field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                <TextInput
                  value={addForm[field]}
                  onChangeText={(t) => setAddForm((p) => ({ ...p, [field]: t }))}
                  placeholder={`Enter ${field === 'mobileNo' ? 'mobile number' : field}`}
                  keyboardType={field === 'mobileNo' || field === 'zipCode' ? 'numeric' : 'default'}
                  style={inputStyle}
                />
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {['quantity', 'taxPrice', 'shippingCost'].map((field) => (
                <View key={field} style={{ flex: 1 }}>
                  <Text style={labelStyle}>{field === 'taxPrice' ? 'Tax' : field === 'shippingCost' ? 'Shipping' : 'Qty'}</Text>
                  <TextInput
                    value={addForm[field]}
                    onChangeText={(t) => setAddForm((p) => ({ ...p, [field]: t }))}
                    keyboardType="decimal-pad"
                    style={inputStyle}
                  />
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 32 }}>
              <TouchableOpacity
                onPress={() => setShowAddForm(false)}
                style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateOrder}
                disabled={saving}
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Create</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={!!editingOrder} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <ScrollView>
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16 }}>Edit Order</Text>
              {['address', 'city', 'country', 'zipCode', 'mobileNo', 'taxPrice', 'shippingCost', 'totalPrice'].map((field) => (
                <View key={field}>
                  <Text style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                  <TextInput
                    value={editForm[field]?.toString() || ''}
                    onChangeText={(t) => setEditForm((p) => ({ ...p, [field]: t }))}
                    style={inputStyle}
                  />
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity
                  onPress={() => setEditingOrder(null)}
                  style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleEditShipping}
                  style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const labelStyle = { fontSize: 13, fontWeight: '500', color: '#374151', marginTop: 8, marginBottom: 4 };
const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
  padding: 10, fontSize: 14, marginBottom: 4, backgroundColor: '#f9fafb',
};
