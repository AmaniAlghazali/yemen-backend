import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import api from '../api/axios';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils/currency';

const CATEGORIES = [
  'All', 'Electronics', 'Clothing', 'Food', 'Books', 'Home & Kitchen',
  'Beauty', 'Sports', 'Automotive', 'Toys & Games', 'Health',
  'Pet Supplies', 'Office Supplies', 'Baby & Kids', 'Jewelry',
  'Music', 'Arts & Crafts', 'Garden', 'Tools', 'Shoes',
  'Bags & Luggage', 'Furniture', 'Groceries', 'Phones & Tablets',
  'Computers & Laptops', 'Cameras', 'Smart Home', 'Stationery',
].filter((c) => c !== 'All');

export default function CreateProductScreen({ navigation }) {
  const { store } = useStore();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !category) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Title, price and category are required' });
      return;
    }
    setLoading(true);
    try {
      const payload = { title, description, price: parseFloat(price), stock: parseInt(stock || '1'), category };
      if (image) payload.image = `data:image/jpeg;base64,${image}`;
      await api.post('/api/v1/products/create-product', payload);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Product created successfully!' });
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20 }}>Add New Product</Text>

        {/* Image Picker */}
        <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center', marginBottom: 20 }}>
          {image ? (
            <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={{ width: '100%', height: 200, borderRadius: 16 }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: 200, borderRadius: 16, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#9ca3af' }}>Tap to add image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Live Preview */}
        {(title || price || category) && (
          <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#bbf7d0' }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#059669', marginBottom: 8 }}>Preview</Text>
            {image && (
              <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
            )}
            {category && (
              <View style={{ backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 4 }}>
                <Text style={{ color: '#fff', fontSize: 11 }}>{category}</Text>
              </View>
            )}
            <Text style={{ fontWeight: '600', color: '#111827', fontSize: 16 }} numberOfLines={1}>{title || 'Product Title'}</Text>
            <Text style={{ color: '#6b7280', fontSize: 13 }} numberOfLines={2}>{description || 'No description'}</Text>
            <Text style={{ fontWeight: '700', color: '#059669', fontSize: 18, marginTop: 4 }}>
              {price ? formatPrice(parseFloat(price), store.currency) : ''}
            </Text>
          </View>
        )}

        <Text style={labelStyle}>Title *</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Product title" placeholderTextColor="#9ca3af" style={inputStyle} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Price *</Text>
            <TextInput value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor="#9ca3af" style={inputStyle} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Stock</Text>
            <TextInput value={stock} onChangeText={setStock} placeholder="1" keyboardType="number-pad" placeholderTextColor="#9ca3af" style={inputStyle} />
          </View>
        </View>

        <Text style={labelStyle}>Category *</Text>
        <TouchableOpacity
          onPress={() => setShowCategories(!showCategories)}
          style={inputStyle}
        >
          <Text style={{ color: category ? '#111827' : '#9ca3af' }}>{category || 'Select category'}</Text>
        </TouchableOpacity>
        {showCategories && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, padding: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <ScrollView style={{ maxHeight: 200 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setCategory(cat); setShowCategories(false); }}
                  style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
                >
                  <Text style={{ color: category === cat ? '#059669' : '#374151', fontWeight: category === cat ? '600' : '400' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={labelStyle}>Description</Text>
        <TextInput
          value={description} onChangeText={setDescription}
          placeholder="Product description" placeholderTextColor="#9ca3af"
          multiline numberOfLines={4}
          style={{ ...inputStyle, height: 100, textAlignVertical: 'top' }}
        />

        <TouchableOpacity
          onPress={handleSubmit} disabled={loading}
          style={{
            backgroundColor: '#059669', borderRadius: 12, padding: 16,
            alignItems: 'center', marginTop: 16, opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Create Product</Text>}
        </TouchableOpacity>
      </ScrollView>
  );
}

const labelStyle = { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4, marginTop: 8 };
const inputStyle = {
  borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
  padding: 12, fontSize: 16, marginBottom: 8, backgroundColor: '#fff',
  justifyContent: 'center',
};
