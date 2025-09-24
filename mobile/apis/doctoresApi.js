import api from './apiClient';

export const getDoctores = async () => {
  try {
    const response = await api.get('/doctores');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener doctores' };
  }
};

export const createDoctor = async (doctorData) => {
  console.log('doctoresApi: createDoctor called with data:', doctorData);
  try {
    console.log('doctoresApi: Making POST request to /doctores');
    const response = await api.post('/doctores', doctorData);
    console.log('doctoresApi: createDoctor request successful', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('doctoresApi: createDoctor request failed', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      fullError: error
    });
    return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Error al crear doctor' };
  }
};

export const updateDoctor = async (id, doctorData) => {
  console.log('doctoresApi: updateDoctor called', { id, doctorData });
  try {
    console.log('doctoresApi: Making PUT request to:', `/doctores/${id}`);
    const response = await api.put(`/doctores/${id}`, doctorData);
    console.log('doctoresApi: Request successful', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('doctoresApi: Request failed', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return { success: false, error: error.response?.data?.error || 'Error al actualizar doctor' };
  }
};

export const deleteDoctor = async (id) => {
  try {
    const response = await api.delete(`/doctores/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al eliminar doctor' };
  }
};

export const getDoctor = async (id) => {
  try {
    const response = await api.get(`/doctores/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener doctor' };
  }
};

export const getCitasByDoctor = async (id) => {
  try {
    const response = await api.get(`/doctores/${id}/citas`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener citas del doctor' };
  }
};

export const getPacientesByDoctor = async (id) => {
  try {
    const response = await api.get(`/doctores/${id}/pacientes`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener pacientes del doctor' };
  }
};