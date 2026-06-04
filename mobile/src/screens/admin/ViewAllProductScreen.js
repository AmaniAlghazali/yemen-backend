import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Image,
  ActivityIndicator, Modal, RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import api from '../../api/axios';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/currency';

const PER_PAGE = 15;
const CATEGORIES = [
  'Electronics', 'Clothing', 'Food', 'Books', 'Home & Kitchen', 'Beauty',
  'Sports', 'Automotive', 'Toys & Games', 'Health', 'Pet Supplies',
  'Office Supplies', 'Baby & Kids', 'Jewelry', 'Music', 'Arts & Crafts',
  'Garden', 'Tools', 'Shoes', 'Bags & Luggage', 'Furniture', 'Groceries',
  'Phones & Tablets', 'Computers & Laptops', 'Cameras', 'Smart Home', 'Stationery',
];

export default function ViewAllProductScreen() {
  const { store } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '1', category: '' });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(1); }, []);

  const fetchProducts = async (p = page) => {
    try {
      const { data } = await api.get(`/api/v1/products/get-all-products?page=${p}`);
      setProducts(data.products || []);
      setTotalCount(data.totalCount || 0);
    } catch (e) {
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    setLoading(true);
    fetchProducts(p);
  };

  const filtered = products.filter((p) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.stock < 20).length;

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ title: '', description: '', price: '', stock: '1', category: '' });
    setImage(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: String(product.price || ''),
      stock: String(product.stock || '1'),
      category: product.category || '',
    });
    setImage(null);
    setShowModal(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true,
    });
    if (!result.canceled && result.assets?.[0]) setImage(result.assets[0].base64);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title, description: form.description,
        price: parseFloat(form.price), stock: parseInt(form.stock), category: form.category,
      };
      if (image) payload.image = `data:image/jpeg;base64,${image}`;

      if (editingProduct) {
        await api.put(`/api/v1/products/update-product/${editingProduct.id}`, payload);
        Toast.show({ type: 'success', text1: 'Updated', text2: 'Product updated successfully' });
      } else {
        await api.post('/api/v1/products/create-product', payload);
        Toast.show({ type: 'success', text1: 'Created', text2: 'Product created successfully' });
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to save product' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/v1/products/delete-product/${id}`);
      Toast.show({ type: 'success', text1: 'Deleted', text2: 'Product deleted successfully' });
      fetchProducts();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to delete' });
    }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 16, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Search products..." placeholderTextColor="#9ca3af"
            style={{
              flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
              borderRadius: 12, padding: 12, fontSize: 14, marginRight: 12,
            }}
          />
          <TouchableOpacity onPress={openCreate} style={{ backgroundColor: '#059669', padding: 12, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Total Products</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#059669' }}>{totalCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12 }}>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Low Stock</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#f59e0b' }}>{lowStockCount}</Text>
          </View>
        </View>

        {filtered.map((product) => {
          const stockBadgeColor = product.stock >= 20 ? '#059669' : '#ef4444';
          return (
            <View key={product.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
              {product.images?.[0]?.url ? (
                <Image source={{ uri: product.images[0].url }} style={{ width: 48, height: 48, borderRadius: 8 }} />
              ) : (
                <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#9ca3af' }}>No img</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '500' }} numberOfLines={1}>{product.title}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{product.category}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ fontSize: 11, color: stockBadgeColor, fontWeight: '500' }}>
                    Stock: {product.stock}
                  </Text>
                </View>
              </View>
              <Text style={{ fontWeight: '600', color: '#059669', marginRight: 12 }}>{formatPrice(product.price, store.currency)}</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity onPress={() => openEdit(product)} style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 6 }}>
                  <Text style={{ color: '#2563eb', fontSize: 12 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(product.id)} style={{ padding: 6, backgroundColor: '#fee2e2', borderRadius: 6 }}>
                  <Text style={{ color: '#ef4444', fontSize: 12 }}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 8 }}>
            <TouchableOpacity
              onPress={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{ padding: 10, borderRadius: 8, backgroundColor: page === 1 ? '#f3f4f6' : '#059669' }}
            >
              <Text style={{ color: page === 1 ? '#9ca3af' : '#fff', fontWeight: '600' }}>Prev</Text>
            </TouchableOpacity>
            <Text style={{ color: '#374151', fontSize: 14 }}>
              Page {page} of {totalPages}
            </Text>
            <TouchableOpacity
              onPress={() => goToPage(page + 1)}
              disabled={page === totalPages}
              style={{ padding: 10, borderRadius: 8, backgroundColor: page === totalPages ? '#f3f4f6' : '#059669' }}
            >
              <Text style={{ color: page === totalPages ? '#9ca3af' : '#fff', fontWeight: '600' }}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <ScrollView style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '85%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>

            <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center', marginBottom: 16 }}>
              {image ? (
                <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={{ width: '100%', height: 150, borderRadius: 12 }} resizeMode="cover" />
              ) : editingProduct?.images?.[0]?.url ? (
                <Image source={{ uri: editingProduct.images[0].url }} style={{ width: '100%', height: 150, borderRadius: 12 }} resizeMode="cover" />
              ) : (
                <View style={{ width: '100%', height: 150, borderRadius: 12, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#9ca3af' }}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>

            {['title', 'description'].map((field) => (
              <View key={field}>
                <Text style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                <TextInput
                  value={form[field]} onChangeText={(t) => setForm((p) => ({ ...p, [field]: t }))}
                  placeholder={field} placeholderTextColor="#9ca3af"
                  multiline={field === 'description'}
                  style={field === 'description' ? { ...inputStyle, height: 80, textAlignVertical: 'top' } : inputStyle}
                />
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {['price', 'stock'].map((field) => (
                <View key={field} style={{ flex: 1 }}>
                  <Text style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                  <TextInput
                    value={form[field]} onChangeText={(t) => setForm((p) => ({ ...p, [field]: t }))}
                    placeholder={field} placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad" style={inputStyle}
                  />
                </View>
              ))}
            </View>

            <Text style={labelStyle}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat} onPress={() => setForm((p) => ({ ...p, category: cat }))}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                    backgroundColor: form.category === cat ? '#059669' : '#f3f4f6',
                  }}
                >
                  <Text style={{ color: form.category === cat ? '#fff' : '#374151', fontSize: 13 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 32 }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#059669', alignItems: 'center', opacity: saving ? 0.6 : 1 }}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const labelStyle = { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 8 };
const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
  padding: 10, fontSize: 14, marginBottom: 4, backgroundColor: '#f9fafb',
};
