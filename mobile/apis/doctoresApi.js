import api from './apiClient';

export const getDoctores = async (especialidadId = null) => {
  try {
    const params = especialidadId ? { especialidad_id: especialidadId } : {};
    const response = await api.get('/doctores', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener doctores' };
  }
};

export const createDoctor = async (doctorData) => {
  try {
    const response = await api.post('/doctores', doctorData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Error al crear doctor' };
  }
};

export const updateDoctor = async (id, doctorData) => {
  try {
    const response = await api.put(`/doctores/${id}`, doctorData);
    return { success: true, data: response.data };
  } catch (error) {
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

export const updateMySchedule = async (scheduleData) => {
  try {
    const response = await api.put('/doctores/schedule', scheduleData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al actualizar horario' };
  }
};