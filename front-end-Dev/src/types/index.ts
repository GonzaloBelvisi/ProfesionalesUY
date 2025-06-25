// Tipos de usuario base
export interface BaseUser {
  _id: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role: 'cliente' | 'profesional';
  createdAt: Date;
  updatedAt: Date;
}

// Tipo de cliente
export interface Cliente extends BaseUser {
  role: 'cliente';
  telefono?: string;
  direccion?: {
    calle?: string;
    numero?: string;
    ciudad?: string;
    codigoPostal?: string;
  };
  historialCitas: string[];
  historialServicios: {
    servicio: string;
    fecha: Date;
    estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  }[];
  direccionesFavoritas: {
    nombre: string;
    ubicacion: {
      type: string;
      coordinates: number[];
    };
  }[];
  metodoPago: {
    tipo: 'tarjeta' | 'efectivo';
    detalles: any;
  }[];
}

// Tipo de calificación
export interface Calificacion {
  cliente: string;
  puntuacion: number;
  comentario?: string;
  fecha: Date;
}

// Tipo de disponibilidad
export interface Disponibilidad {
  horarios: {
    dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
    horaInicio: string;
    horaFin: string;
  }[];
  estado: 'disponible' | 'ocupado' | 'no_disponible';
}

// Tipo de servicio
export interface Servicio {
  nombre: string;
  descripcion: string;
  precio: number;
  duracionEstimada: number; // en minutos
}

// Tipo de documentos verificados
export interface DocumentosVerificados {
  dni: {
    numero: string;
    verificado: boolean;
  };
  matricula: {
    numero: string;
    verificado: boolean;
  };
  antecedentes: {
    verificado: boolean;
    fechaVerificacion: Date;
  };
}

// Tipo de profesional
export interface Profesional extends BaseUser {
  role: 'profesional';
  telefono?: string;
  profesion: string;
  especialidades: string[];
  experiencia: number; // años de experiencia
  calificaciones: Calificacion[];
  promedioCalificacion: number;
  disponibilidad: Disponibilidad;
  servicios: Servicio[];
  documentosVerificados: DocumentosVerificados;
  radio_cobertura: number; // Radio en kilómetros
}

// Tipo de cita
export interface Cita {
  _id: string;
  client: string;
  professional: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
  createdAt: Date;
}

// Tipo de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tipo de respuesta de login
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: Cliente | Profesional;
  };
}

// Tipo de filtros de búsqueda
export interface FiltrosBusqueda {
  profesion?: string;
  especialidad?: string;
  ubicacion?: {
    lat: number;
    lng: number;
    radio: number;
  };
  calificacionMinima?: number;
  disponibilidad?: {
    dia?: string;
    hora?: string;
  };
  precioMaximo?: number;
}

// Tipo de contexto de autenticación
export interface AuthContextType {
  user: Cliente | Profesional | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any, tipo: 'cliente' | 'profesional') => Promise<ApiResponse<Cliente> | ApiResponse<Profesional>>;
  loading: boolean;
  loginError: string | null;
  setLoginError: (msg: string | null) => void;
  clearLoginError: () => void;
} 