export interface ReservationData {
  id?: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  roomType: string;
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

export interface Availability {
  date: Date;
  availableRooms: number[];
}