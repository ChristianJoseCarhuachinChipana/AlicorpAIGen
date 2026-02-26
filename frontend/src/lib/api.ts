import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.access_token) {
      Cookies.set('access_token', response.data.access_token, { expires: 1 });
    }
    return response.data;
  },

  register: async (email: string, password: string, nombre: string, role: string = 'creador') => {
    const response = await api.post('/api/auth/register', { email, password, nombre, role });
    return response.data;
  },

  logout: () => {
    Cookies.remove('access_token');
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export const brandApi = {
  createManual: async (data: {
    nombre: string;
    producto: string;
    tono: string;
    público_objetivo: string;
    restricciones: string;
  }) => {
    const response = await api.post('/api/brand/manual', data);
    return response.data;
  },

  listManuals: async () => {
    const response = await api.get('/api/brand/manual');
    return response.data;
  },

  getManual: async (id: string) => {
    const response = await api.get(`/api/brand/manual/${id}`);
    return response.data;
  },

  deleteManual: async (id: string) => {
    const response = await api.delete(`/api/brand/manual/${id}`);
    return response.data;
  },
};

export const contenidoApi = {
  create: async (data: {
    brand_manual_id: string;
    tipo: string;
    titulo: string;
  }) => {
    const response = await api.post('/api/contenido/', data);
    return response.data;
  },

  list: async (estado?: string) => {
    const params = estado ? { estado } : {};
    const response = await api.get('/api/contenido/', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/api/contenido/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch(`/api/contenido/${id}/aprobar`);
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await api.patch(`/api/contenido/${id}/rechazar`, null, {
      params: { rechazo_razon: reason },
    });
    return response.data;
  },
};

export const auditoriaApi = {
  auditImage: async (contenidoId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('contenido_id', contenidoId);
    formData.append('image', imageFile);

    const response = await api.post('/api/auditoria/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getByContenido: async (contenidoId: string) => {
    const response = await api.get(`/api/auditoria/contenido/${contenidoId}`);
    return response.data;
  },

  list: async (limit: number = 20) => {
    const response = await api.get('/api/auditoria/', { params: { limit } });
    return response.data;
  },

  getImageBase64: async (auditoriaId: string) => {
    const response = await api.get(`/api/auditoria/${auditoriaId}/imagen`, {
      responseType: 'text',
    });
    return response.data;
  },
};
