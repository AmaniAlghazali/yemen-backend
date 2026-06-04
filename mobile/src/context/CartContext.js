import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchCart();
  }, [token]);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/cart');
      setCartItems(data.cart?.items || []);
    } catch (e) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addToCart = useCallback(async (productId, title, price, image, quantity = 1) => {
    const { data } = await api.post('/api/v1/cart/add', {
      productId, title, price, image, quantity,
    });
    setCartItems(data.cart?.items || []);
    return data;
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const { data } = await api.put(`/api/v1/cart/update/${productId}`, { quantity });
    setCartItems(data.cart?.items || []);
    return data;
  }, []);

  const removeItem = useCallback(async (productId) => {
    const { data } = await api.delete(`/api/v1/cart/remove/${productId}`);
    setCartItems(data.cart?.items || []);
    return data;
  }, []);

  const clearCart = useCallback(async () => {
    await api.delete('/api/v1/cart/clear');
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems, loading, cartCount,
      fetchCart, addToCart, updateQuantity, removeItem, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
