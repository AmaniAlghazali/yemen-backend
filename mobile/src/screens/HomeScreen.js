import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, FlatList,
  RefreshControl, Image, Dimensions, Animated,
} from 'react-native';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 40) / 2;

const CATEGORIES = [
  'All', 'Electronics', 'Clothing', 'Food', 'Books', 'Home & Kitchen',
  'Beauty', 'Sports', 'Automotive', 'Toys & Games', 'Health',
  'Pet Supplies', 'Office Supplies', 'Baby & Kids', 'Jewelry',
  'Music', 'Arts & Crafts', 'Garden', 'Tools', 'Shoes',
  'Bags & Luggage', 'Furniture', 'Groceries', 'Phones & Tablets',
  'Computers & Laptops', 'Cameras', 'Smart Home', 'Stationery',
];

const heroSlides = [
  { id: 1, title: 'Welcome to Yemen Marketplace', subtitle: 'Discover amazing products at great prices', color: '#059669' },
  { id: 2, title: 'Shop the Best Deals', subtitle: 'Electronics, fashion, home & more', color: '#2563eb' },
  { id: 3, title: 'Fast Delivery', subtitle: 'Free shipping on orders over 200 SAR', color: '#7c3aed' },
  { id: 4, title: '24/7 Support', subtitle: 'We are here to help you anytime', color: '#dc2626' },
];

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    startAutoSlide();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
  };

  const handleSlidePress = (index) => {
    setCurrentSlide(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startAutoSlide();
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/v1/products/get-all-products');
      setProducts(data.products || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchTerm && !p.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Carousel */}
      <View style={{ height: 200, backgroundColor: heroSlides[currentSlide].color, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 }}>
          {heroSlides[currentSlide].title}
        </Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
          {heroSlides[currentSlide].subtitle}
        </Text>
        <View style={{ flexDirection: 'row', position: 'absolute', bottom: 16, gap: 8 }}>
          {heroSlides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => handleSlidePress(i)}>
              <View style={{
                width: i === currentSlide ? 24 : 8, height: 8, borderRadius: 4,
                backgroundColor: i === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
              }} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ padding: 16, paddingBottom: 60 }}>
        {/* Search */}
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search products..."
          placeholderTextColor="#9ca3af"
          style={{
            backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
            borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12,
          }}
        />

        {/* Price Filter */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            value={minPrice} onChangeText={setMinPrice}
            placeholder="Min price"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            style={{
              flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
              borderRadius: 12, padding: 10, fontSize: 14,
            }}
          />
          <TextInput
            value={maxPrice} onChangeText={setMaxPrice}
            placeholder="Max price"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            style={{
              flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
              borderRadius: 12, padding: 10, fontSize: 14,
            }}
          />
        </View>

        {/* Category Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, marginBottom: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedCategory === item ? '#059669' : '#fff',
                borderWidth: 1, borderColor: '#e5e7eb',
              }}
            >
              <Text style={{
                color: selectedCategory === item ? '#fff' : '#374151',
                fontWeight: '500', fontSize: 14,
              }}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Section Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>Our Collection</Text>
          <Text style={{ color: '#6b7280', fontSize: 13 }}>{filteredProducts.length} items</Text>
        </View>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ color: '#9ca3af', fontSize: 16, marginBottom: 12 }}>No items match your criteria</Text>
            <TouchableOpacity
              onPress={() => { setSearchTerm(''); setSelectedCategory('All'); setMinPrice(''); setMaxPrice(''); }}
              style={{ backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={{ width: CARD_WIDTH }}>
                <ProductCard
                  product={product}
                  onPress={(id) => navigation.navigate('ProductDetail', { productId: id })}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
