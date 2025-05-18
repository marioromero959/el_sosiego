export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'guest' | 'admin';
  reservations?: number[];
  createdAt?: Date;
}