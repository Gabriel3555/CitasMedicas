import api from './apiClient';

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error en login' };
  }
};

export const register = async (name, email, password, password_confirmation, role) => {
  try {
    const response = await api.post('/register', { name, email, password, password_confirmation, role });
    return { success: true, data: response.data };
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = 'Error en registro';
    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.errors) {
        // Validation errors
        errorMessage = Object.values(errorData.errors).flat().join('\n');
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }
    return { success: false, error: errorMessage };
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/logout');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error en logout' };
  }
};

export const refresh = async () => {
  try {
    const response = await api.post('/refresh');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error en refresh' };
  }
};

export const me = async () => {
  try {
    const response = await api.get('/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error en obtener usuario' };
  }
};

export const uploadProfilePhoto = async (photoUri) => {
  try {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'profile_photo.jpg',
    });

    const response = await api.post('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Error al subir la foto'
    };
  }
};