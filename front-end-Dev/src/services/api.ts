import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, LoginResponse, Cliente, Profesional, Cita, FiltrosBusqueda } from '../types';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:4000/api'; // Volvemos a localhost para pruebas en web

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  // Registro de cliente
  registerCliente: async (userData: Partial<Cliente>): Promise<ApiResponse<Cliente>> => {
    const response = await api.post<ApiResponse<Cliente>>('/auth/registro/cliente', userData);
    return response.data;
  },

  // Registro de profesional
  registerProfesional: async (userData: Partial<Profesional>): Promise<ApiResponse<Profesional>> => {
    const response = await api.post<ApiResponse<Profesional>>('/auth/registro/profesional', userData);
    return response.data;
  },

  // Verificar si el email ya está registrado
  checkEmailExists: async (email: string, tipo: 'cliente' | 'profesional'): Promise<boolean> => {
    try {
      const endpoint = tipo === 'cliente' ? '/auth/registro/cliente' : '/auth/registro/profesional';
      await api.post(endpoint, { email });
      return false; // No existe
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.mensaje && error.response.data.mensaje.includes('registrado')) {
        return true; // Ya existe
      }
      return false;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Recuperar contraseña
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password', { email });
    return response.data;
  },

  // Resetear contraseña
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Servicios de perfiles
export const profileService = {
  // Obtener perfil de cliente
  getClientProfile: async (id: string): Promise<ApiResponse<Cliente>> => {
    const response = await api.get<ApiResponse<Cliente>>(`/profiles/cliente/${id}`);
    return response.data;
  },

  // Obtener perfil de profesional
  getProfessionalProfile: async (id: string): Promise<ApiResponse<Profesional>> => {
    const response = await api.get<ApiResponse<Profesional>>(`/profiles/profesional/${id}`);
    return response.data;
  },

  // Actualizar perfil de cliente
  updateClientProfile: async (id: string, data: Partial<Cliente>): Promise<ApiResponse<Cliente>> => {
    const response = await api.put<ApiResponse<Cliente>>(`/profiles/cliente/actualizar/${id}`, data);
    return response.data;
  },

  // Actualizar perfil de profesional
  updateProfessionalProfile: async (id: string, data: Partial<Profesional>): Promise<ApiResponse<Profesional>> => {
    const response = await api.put<ApiResponse<Profesional>>(`/profiles/profesional/actualizar/${id}`, data);
    return response.data;
  },

  // Obtener todos los profesionales
  getAllProfessionals: async (): Promise<ApiResponse<Profesional[]>> => {
    const response = await api.get<ApiResponse<Profesional[]>>('/profiles/profesionales');
    return response.data;
  },

  // Buscar profesionales por profesión
  searchProfessionalsByProfession: async (profesion: string): Promise<ApiResponse<Profesional[]>> => {
    const response = await api.get<ApiResponse<Profesional[]>>(`/profiles/profesionales/buscar?profesion=${profesion}`);
    return response.data;
  },

  // Calificar profesional
  rateProfessional: async (id: string, calificacion: { puntuacion: number; comentario?: string }): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/profiles/profesional/calificacion/${id}`, calificacion);
    return response.data;
  },

  // Obtener calificaciones de un profesional
  getProfessionalRatings: async (id: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>(`/profiles/profesional/calificaciones/${id}`);
    return response.data;
  },

  // Establecer horario de profesional
  setProfessionalSchedule: async (id: string, horarios: any): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/profiles/profesional/horario/${id}`, horarios);
    return response.data;
  },

  // Obtener horario de profesional
  getProfessionalSchedule: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>(`/profiles/profesional/horario/${id}`);
    return response.data;
  },
};

// Servicios de citas
export const appointmentService = {
  // Crear cita
  createAppointment: async (appointmentData: Partial<Cita>): Promise<ApiResponse<Cita>> => {
    const response = await api.post<ApiResponse<Cita>>('/appointments', appointmentData);
    return response.data;
  },

  // Obtener todas las citas
  getAllAppointments: async (): Promise<ApiResponse<Cita[]>> => {
    const response = await api.get<ApiResponse<Cita[]>>('/appointments');
    return response.data;
  },

  // Obtener cita por ID
  getAppointmentById: async (id: string): Promise<ApiResponse<Cita>> => {
    const response = await api.get<ApiResponse<Cita>>(`/appointments/${id}`);
    return response.data;
  },

  // Actualizar cita
  updateAppointment: async (id: string, data: Partial<Cita>): Promise<ApiResponse<Cita>> => {
    const response = await api.put<ApiResponse<Cita>>(`/appointments/${id}`, data);
    return response.data;
  },

  // Eliminar cita
  deleteAppointment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/appointments/${id}`);
    return response.data;
  },

  // Obtener citas de un cliente
  getAppointmentsByClient: async (clientId: string): Promise<ApiResponse<Cita[]>> => {
    const response = await api.get<ApiResponse<Cita[]>>(`/appointments/client/${clientId}`);
    return response.data;
  },

  // Obtener citas de un profesional
  getAppointmentsByProfessional: async (professionalId: string): Promise<ApiResponse<Cita[]>> => {
    const response = await api.get<ApiResponse<Cita[]>>(`/appointments/professional/${professionalId}`);
    return response.data;
  },

  // Obtener horarios disponibles
  getAvailableSlots: async (professionalId: string, date: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get<ApiResponse<string[]>>(`/appointments/available-slots/${professionalId}/${date}`);
    return response.data;
  },
};

// Servicios de búsqueda
export const searchService = {
  // Buscar profesionales con filtros
  searchProfessionals: async (filtros: FiltrosBusqueda): Promise<ApiResponse<Profesional[]>> => {
    const response = await api.post<ApiResponse<Profesional[]>>('/search/professionals', filtros);
    return response.data;
  },
};

export default api; 