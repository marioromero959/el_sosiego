import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { ReservationData, Room, DateAvailability, CalendarMonth } from '../models/reservation.model';
import { environment } from '../../../environments/environment';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = environment.apiUrl;
  private readonly PRICE_PER_NIGHT = 200; // Precio fijo en USD por noche
  
  // Mock data for development
  private mockRooms: Room[] = [
    {
      id: 1,
      name: 'Habitación Estándar',
      type: 'standard',
      description: 'Acogedora habitación con todas las comodidades para una estancia agradable.',
      capacity: 2,
      pricePerNight: this.PRICE_PER_NIGHT,
      size: 25,
      beds: '1 Cama King',
      amenities: ['TV', 'Wi-Fi', 'Baño privado', 'Vista al jardín'],
      images: ['assets/images/room1.jpg', 'assets/images/room1-2.jpg'],
      available: true
    },
    {
      id: 2,
      name: 'Habitación Superior',
      type: 'superior',
      description: 'Espaciosa habitación con vistas impresionantes y detalles de lujo.',
      capacity: 2,
      pricePerNight: this.PRICE_PER_NIGHT,
      size: 35,
      beds: '1 Cama King',
      amenities: ['TV', 'Wi-Fi', 'Baño privado', 'Minibar', 'Vista a la montaña'],
      images: ['assets/images/room2.jpg', 'assets/images/room2-2.jpg'],
      available: true
    },
    {
      id: 3,
      name: 'Suite Familiar',
      type: 'family',
      description: 'Perfecta para familias, con amplios espacios y todas las comodidades.',
      capacity: 4,
      pricePerNight: this.PRICE_PER_NIGHT,
      size: 50,
      beds: '1 Cama King + 2 Camas Individuales',
      amenities: ['TV', 'Wi-Fi', 'Baño privado', 'Sala de estar', 'Terraza privada', 'Vista panorámica'],
      images: ['assets/images/room3.jpg', 'assets/images/room3-2.jpg'],
      available: true
    }
  ];

  constructor(private http: HttpClient) { }

  // Simulación de disponibilidad por fechas
  private generateMockAvailability(startDate: Date, endDate: Date): DateAvailability[] {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    console.log("days", days);
    
    return days.map(date => {
      // Simulamos diferentes niveles de disponibilidad
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const randomFactor = Math.random();
      
      // Los fines de semana tienen menos disponibilidad
      let availableRooms = isWeekend ? Math.floor(randomFactor * 2) + 1 : Math.floor(randomFactor * 3) + 1;
      
      // Simulamos algunos días completamente ocupados
      if (randomFactor < 0.1) {
        availableRooms = 0;
      }
      
      // No permitir reservas en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isAvailable = date >= today && availableRooms > 0;
      
      return {
        date: date,
        available: isAvailable,
        availableRooms: isAvailable ? availableRooms : 0,
        minPrice: this.PRICE_PER_NIGHT, // Precio fijo
        maxPrice: this.PRICE_PER_NIGHT  // Precio fijo
      };
    });
  }

  // Obtener disponibilidad para un mes específico
  getMonthAvailability(year: number, month: number): Observable<CalendarMonth> {
    // En un entorno real: return this.http.get<CalendarMonth>(`${this.apiUrl}/availability/${year}/${month}`);
    
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));
    
    const availability = this.generateMockAvailability(monthStart, monthEnd);
    
    const calendarMonth: CalendarMonth = {
      year: year,
      month: month,
      days: availability
    };
    
    return of(calendarMonth).pipe(delay(500));
  }

  // Obtener disponibilidad para un rango de fechas
  getDateRangeAvailability(startDate: Date, endDate: Date): Observable<DateAvailability[]> {
    // En un entorno real: return this.http.post<DateAvailability[]>(`${this.apiUrl}/availability/range`, { startDate, endDate });
    
    const availability = this.generateMockAvailability(startDate, endDate);
    return of(availability).pipe(delay(800));
  }

  // Verificar si un rango de fechas está disponible
  checkDateRangeAvailability(checkIn: Date, checkOut: Date, guests: number): Observable<{available: boolean, totalPrice: number}> {
    // En un entorno real: return this.http.post<any>(`${this.apiUrl}/check-availability`, { checkIn, checkOut, guests });
    
    const availability = this.generateMockAvailability(checkIn, checkOut);
    console.log("availability", availability);
    const allDaysAvailable = availability.every(day => day.available && day.availableRooms >= Math.ceil(guests / 2));
    
    // Calcular precio total basado en las noches (sin incluir el día de checkout)
    const nights = availability.length; // No contar el día de checkout
    const totalPrice = allDaysAvailable ? (nights * this.PRICE_PER_NIGHT) : 0;
    
    return of({
      available: allDaysAvailable,
      totalPrice: totalPrice
    }).pipe(delay(600));
  }

  createReservation(reservation: ReservationData): Observable<ReservationData> {
    // En un entorno real: return this.http.post<ReservationData>(`${this.apiUrl}/reservations`, reservation);
    
    const newReservation: ReservationData = {
      ...reservation,
      id: Math.floor(Math.random() * 1000) + 1,
      status: 'confirmed',
      createdAt: new Date()
    };
    
    return of(newReservation).pipe(delay(1200));
  }

  // Obtener precio por noche
  getPricePerNight(): number {
    return this.PRICE_PER_NIGHT;
  }

  // Mantener métodos anteriores para compatibilidad
  getRooms(): Observable<Room[]> {
    return of(this.mockRooms).pipe(delay(800));
  }

  getRoom(id: number): Observable<Room> {
    const room = this.mockRooms.find(r => r.id === id);
    return of(room as Room).pipe(delay(500));
  }
}