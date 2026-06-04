import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/v1/users/login-user', { email, password });
    const { token: newToken, user: userData } = data;
    await AsyncStorage.multiSet([
      ['token', newToken],
      ['userRole', userData.role],
      ['userId', userData.id],
      ['user', JSON.stringify(userData)],
    ]);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await api.post('/api/v1/users/register-user', userData);
    const { token: newToken, user: newUser } = data;
    await AsyncStorage.multiSet([
      ['token', newToken],
      ['userRole', newUser.role],
      ['userId', newUser.id],
      ['user', JSON.stringify(newUser)],
    ]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.get('/api/v1/users/logout');
    } catch (e) {
    }
    await AsyncStorage.multiRemove(['token', 'userRole', 'userId', 'user', 'userAvatar']);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/api/v1/users/profile');
      const userData = data.user || data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'admin',
      login, register, logout, updateUser, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
