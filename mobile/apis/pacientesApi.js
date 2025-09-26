import api from './apiClient';

export const getPacientes = async () => {
  try {
    const response = await api.get('/pacientes');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener pacientes' };
  }
};

export const createPaciente = async (pacienteData) => {
  try {
    const response = await api.post('/pacientes', pacienteData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Error al crear paciente' };
  }
};

export const updatePaciente = async (id, pacienteData) => {
  try {
    const response = await api.put(`/pacientes/${id}`, pacienteData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al actualizar paciente' };
  }
};

export const deletePaciente = async (id) => {
  try {
    const response = await api.delete(`/pacientes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al eliminar paciente' };
  }
};

export const getPaciente = async (id) => {
  try {
    const response = await api.get(`/pacientes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener paciente' };
  }
};

export const getCitasByPaciente = async (id) => {
  try {
    const response = await api.get(`/pacientes/${id}/citas`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener citas del paciente' };
  }
};

export const getDoctoresByPaciente = async (id) => {
  try {
    const response = await api.get(`/pacientes/${id}/doctores`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener doctores del paciente' };
  }
};