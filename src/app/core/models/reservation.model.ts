export interface ReservationData {
  id?: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;
  totalPrice?: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: Date;
}

export interface Room {
  id: number;
  name: string;
  type: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  size: number;
  beds: string;
  amenities: string[];
  images: string[];
  available: boolean;
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