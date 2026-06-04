import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DEV_CONFIG from './config';

function getBaseUrl() {
  const { LAN_IP, PORT } = DEV_CONFIG;
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${PORT}`;
  }
  return `http://${LAN_IP}:${PORT}`;
}

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'userRole', 'userId', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;
