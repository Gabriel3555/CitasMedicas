import api from './apiClient';

export const getEps = async () => {
  try {
    const response = await api.get('/eps');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener EPS' };
  }
};

export const createEps = async (epsData) => {
  try {
    const response = await api.post('/eps', epsData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al crear EPS' };
  }
};

export const updateEps = async (id, epsData) => {
  try {
    const response = await api.put(`/eps/${id}`, epsData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al actualizar EPS' };
  }
};

export const deleteEps = async (id) => {
  try {
    const response = await api.delete(`/eps/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al eliminar EPS' };
  }
};

export const getEpsById = async (id) => {
  try {
    const response = await api.get(`/eps/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener EPS' };
  }
};