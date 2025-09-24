import api from './apiClient';

export const getCitas = async () => {
  try {
    const response = await api.get('/citas');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener citas' };
  }
};

export const createCita = async (citaData) => {
  try {
    const response = await api.post('/citas', citaData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al crear cita' };
  }
};

export const updateCita = async (id, citaData) => {
  try {
    const response = await api.put(`/citas/${id}`, citaData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al actualizar cita' };
  }
};

export const deleteCita = async (id) => {
  try {
    const response = await api.delete(`/citas/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al eliminar cita' };
  }
};

export const getCita = async (id) => {
  try {
    const response = await api.get(`/citas/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener cita' };
  }
};

export const getCitaCompleta = async (id) => {
  try {
    const response = await api.get(`/citas/${id}/detalle`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener detalle de cita' };
  }
};


export const getMyCitas = async () => {
  try {
    const response = await api.get('/my-citas');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener mis citas' };
  }
};

export const getMyCitasDoctor = async () => {
  try {
    const response = await api.get('/my-citas-doctor');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || 'Error al obtener mis citas como doctor' };
  }
};

export const getAvailableSlots = async (doctorId, fecha) => {
  console.log('citasApi@getAvailableSlots - Request initiated', {
    doctorId,
    fecha,
    timestamp: new Date().toISOString()
  });

  try {
    console.log('citasApi@getAvailableSlots - Making API call', {
      url: '/citas/available-slots',
      params: { doctor_id: doctorId, fecha: fecha }
    });

    const response = await api.get('/citas/available-slots', {
      params: { doctor_id: doctorId, fecha: fecha }
    });

    console.log('citasApi@getAvailableSlots - API call successful', {
      status: response.status,
      data: response.data,
      slots_count: response.data.slots ? response.data.slots.length : 0
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('citasApi@getAvailableSlots - API call failed', {
      error: error,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    });

    return { success: false, error: error.response?.data?.error || 'Error al obtener slots disponibles' };
  }
};