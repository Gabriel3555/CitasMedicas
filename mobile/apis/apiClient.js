import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://10.2.235.43:8000/api';

const getToken = async () => {
  // Obtener el token de autenticación del almacenamiento local
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    return null;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }, 
});

api.interceptors.request.use(async (config) => {
  // Agregar automáticamente el token de autenticación a todas las peticiones
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;