import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const StoreContext = createContext(null);

const defaultStore = {
  storeName: 'Yemen Marketplace',
  currency: 'SAR',
  taxRate: 15,
  maintenanceMode: false,
};

export function StoreProvider({ children }) {
  const [store, setStore] = useState(defaultStore);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data } = await api.get('/api/v1/store/settings');
      if (data.store) {
        setStore((prev) => ({ ...prev, ...data.store }));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const updateStoreSettings = async (settings) => {
    const { data } = await api.put('/api/v1/store/settings', settings);
    if (data.store) {
      setStore((prev) => ({ ...prev, ...data.store }));
    }
    return data;
  };

  return (
    <StoreContext.Provider value={{ store, loading, updateStoreSettings, refresh: fetchStoreSettings }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
