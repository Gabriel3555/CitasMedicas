import api from './apiClient';

export const getEspecialidades = async () => {
  try {
    const response = await api.get('/especialidades');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener especialidades' };
  }
};

export const createEspecialidad = async (especialidadData) => {
  try {
    const response = await api.post('/especialidades', especialidadData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al crear especialidad' };
  }
};

export const updateEspecialidad = async (id, especialidadData) => {
  try {
    const response = await api.put(`/especialidades/${id}`, especialidadData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al actualizar especialidad' };
  }
};

export const deleteEspecialidad = async (id) => {
  try {
    const response = await api.delete(`/especialidades/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al eliminar especialidad' };
  }
};

export const getEspecialidad = async (id) => {
  try {
    const response = await api.get(`/especialidades/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener especialidad' };
  }
};