import { Room } from './room.model';
import { User } from './user.model';

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