import { Room } from './room.model';
import { User } from './user.model';

// ========================================
// INTERFACES EXISTENTES (MANTENIDAS)
// ========================================

export interface Reservation {
  id?: number;
  attributes: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    totalPrice: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    specialRequests?: string;
    room?: {
      data: {
        id: number;
        attributes: Room;
      };
    };
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
}

export interface DateAvailability {
  date: Date;
  available: boolean;
  availableRooms: number;
  minPrice: number;
  maxPrice: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: DateAvailability[];
}

export interface ReservationData {
  id?: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status?: string;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
  roomId?: number;
  createdAt?: Date;
}

// ========================================
// NUEVAS INTERFACES PARA FUNCIONALIDAD EXTENDIDA
// ========================================

// Modelo principal de Reserva (nueva estructura para el backend actualizado)
export interface ReservationNew {
  id?: number;
  documentId?: string;
  name: string;
  email: string;
  phone: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string;
  totalPrice: number;
  statusReservation: 'pending' | 'confirmed' | 'cancelled';
  confirmationCode?: string;
  emailSent?: boolean;
  emailSentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Para la creación de reservas con la nueva estructura
export interface CreateReservationData {
  name: string;
  email: string;
  phone: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string;
  totalPrice: number;
}

// Respuesta de la API al crear reserva
export interface CreateReservationResponse {
  success: boolean;
  reservation?: ReservationNew;
  message?: string;
  confirmationCode?: string;
}

// Para verificar disponibilidad
export interface AvailabilityCheckRequest {
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  totalPrice: number;
  message?: string;
  conflictingDates?: string[];
}

// Para búsqueda por código de confirmación
export interface ReservationLookupResponse {
  success: boolean;
  reservation?: ReservationNew;
  message?: string;
}

// Para reenvío de email
export interface EmailResendResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
}

// ========================================
// TIPOS AUXILIARES Y UTILIDADES
// ========================================

// Tipo unión para manejar ambas estructuras de reserva
export type AnyReservation = Reservation | ReservationNew;

// Helper para convertir entre estructuras
export interface ReservationConverter {
  // Convertir de estructura antigua a nueva
  fromLegacy(legacy: Reservation): ReservationNew;
  // Convertir de estructura nueva a antigua
  toLegacy(modern: ReservationNew): Reservation;
}

// Implementación del converter
export const reservationConverter: ReservationConverter = {
  fromLegacy(legacy: Reservation): ReservationNew {
    return {
      id: legacy.id,
      name: legacy.attributes.customerName,
      email: legacy.attributes.customerEmail,
      phone: legacy.attributes.customerPhone || '',
      checkIn: legacy.attributes.checkIn,
      checkOut: legacy.attributes.checkOut,
      guests: legacy.attributes.guests,
      specialRequests: legacy.attributes.specialRequests,
      totalPrice: legacy.attributes.totalPrice,
      statusReservation: legacy.attributes.status === 'completed' ? 'confirmed' : 
                        legacy.attributes.status as 'pending' | 'confirmed' | 'cancelled',
      createdAt: legacy.attributes.createdAt ? new Date(legacy.attributes.createdAt) : undefined,
      updatedAt: legacy.attributes.updatedAt ? new Date(legacy.attributes.updatedAt) : undefined
    };
  },

  toLegacy(modern: ReservationNew): Reservation {
    return {
      id: modern.id,
      attributes: {
        customerName: modern.name,
        customerEmail: modern.email,
        customerPhone: modern.phone,
        checkIn: modern.checkIn,
        checkOut: modern.checkOut,
        guests: modern.guests,
        specialRequests: modern.specialRequests,
        totalPrice: modern.totalPrice,
        status: modern.statusReservation === 'confirmed' ? 'confirmed' : 
                modern.statusReservation as 'pending' | 'confirmed' | 'cancelled' | 'completed',
        createdAt: modern.createdAt?.toISOString(),
        updatedAt: modern.updatedAt?.toISOString()
      }
    };
  }
};

// ========================================
// ENUMS Y CONSTANTES
// ========================================

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum ReservationStatusNew {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export const RESERVATION_STATUS_LABELS = {
  [ReservationStatus.PENDING]: 'Pendiente',
  [ReservationStatus.CONFIRMED]: 'Confirmada',
  [ReservationStatus.CANCELLED]: 'Cancelada',
  [ReservationStatus.COMPLETED]: 'Completada'
};

export const RESERVATION_STATUS_NEW_LABELS = {
  [ReservationStatusNew.PENDING]: 'Pendiente',
  [ReservationStatusNew.CONFIRMED]: 'Confirmada',
  [ReservationStatusNew.CANCELLED]: 'Cancelada'
};

// ========================================
// TIPOS PARA FILTROS Y CONSULTAS
// ========================================

export interface ReservationFilters {
  status?: string;
  roomId?: number;
  customerEmail?: string;
  startDate?: Date;
  endDate?: Date;
  confirmationCode?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReservationQuery extends ReservationFilters {
  pagination?: PaginationOptions;
}

// ========================================
// INTERFACES PARA ESTADÍSTICAS Y REPORTES
// ========================================

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed?: number;
  totalRevenue: number;
  averageStay: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  reservations: number;
  revenue: number;
  occupancyRate: number;
}

// ========================================
// VALIDADORES Y HELPERS
// ========================================

export function isValidReservationData(data: any): data is CreateReservationData {
  return data &&
         typeof data.name === 'string' &&
         typeof data.email === 'string' &&
         typeof data.phone === 'string' &&
         data.checkIn instanceof Date &&
         data.checkOut instanceof Date &&
         typeof data.guests === 'number' &&
         typeof data.totalPrice === 'number';
}

export function isValidDateRange(checkIn: Date, checkOut: Date): boolean {
  return checkIn < checkOut && checkIn >= new Date();
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}