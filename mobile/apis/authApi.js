import api from './apiClient';

export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error en login' };
  }
};

export const register = async (name, email, password, password_confirmation, role, additionalData = {}) => {
  try {
    const requestData = { name, email, password, password_confirmation, role, ...additionalData };
    const response = await api.post('/register', requestData);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('Registration error:', error);
    console.log('Error response:', error.response);
    console.log('Error response data:', error.response?.data);

    const errorData = error.response?.data;
    let errorMessage = 'Error en registro';

    if (errorData) {
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.errors) {
        if (typeof errorData.errors === 'object') {
          const errorMessages = [];
          for (const field in errorData.errors) {
            if (Array.isArray(errorData.errors[field])) {
              errorMessages.push(...errorData.errors[field]);
            } else {
              errorMessages.push(errorData.errors[field]);
            }
          }
          errorMessage = errorMessages.join('\n');
        } else {
          errorMessage = String(errorData.errors);
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.email && Array.isArray(errorData.email)) {
        errorMessage = errorData.email.join('\n');
      }
    }

    if (!errorMessage || errorMessage === 'Error en registro') {
      if (error.message) {
        errorMessage = `Error de conexión: ${error.message}`;
      } else {
        errorMessage = 'Error desconocido en el registro';
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

export const updateProfile = async (name, email) => {
  try {
    const response = await api.put('/profile', {
      name,
      email,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Error al actualizar el perfil'
    };
  }
};

export const updatePatientProfile = async (name, email, phone) => {
  try {
    const response = await api.put('/profile', {
      name,
      email,
      telefono: phone,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Error al actualizar el perfil de paciente'
    };
  }
};

export const updateDoctorProfile = async (name, email, phone) => {
  try {
    const response = await api.put('/profile', {
      name,
      email,
      telefono: phone,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Error al actualizar el perfil de doctor'
    };
  }
};

export const changePassword = async (currentPassword, newPassword, passwordConfirmation) => {
  try {
    const response = await api.put('/profile/password', {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: passwordConfirmation,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Error al cambiar la contraseña'
    };
  }
};

export const adminChangeUserPassword = async (userId, newPassword, passwordConfirmation) => {
  try {
    const response = await api.put(`/admin/users/${userId}/password`, {
      password: newPassword,
      password_confirmation: passwordConfirmation,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Error al cambiar la contraseña del usuario'
    };
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