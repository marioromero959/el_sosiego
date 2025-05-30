import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, tap, delay } from 'rxjs';
import { ReservationData, DateAvailability, CalendarMonth, Reservation } from '../models/reservation.model';
import { Room } from '../models/room.model';
import { environment } from '../../../environments/environment';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, differenceInDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { ApiService, StrapiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = environment.apiUrl;
  private readonly PRICE_PER_NIGHT = 200; // Precio fijo en USD por noche
  
  constructor(private http: HttpClient, private apiService: ApiService) { }

  // Obtener todas las habitaciones
  getRooms(): Observable<Room[]> {
    return this.apiService.get<Room>('rooms', {
      populate: '*'
    }).pipe(
      map(response => {
        if (!response.data) {
          console.error('No se recibieron datos de la API');
          return [];
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [response.data];
      }),
      catchError(error => {
        console.error('Error al obtener las habitaciones:', error);
        return of([]);
      })
    );
  }

  // Obtener una habitación específica
  getRoom(id: number): Observable<Room> {
    return this.apiService.get<Room>(`rooms/${id}`, {
      populate: '*'
    }).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('No se encontró la habitación');
        }
        return response.data as Room;
      }),
      catchError(error => {
        console.error(`Error al obtener la habitación ${id}:`, error);
        throw error;
      })
    );
  }

  // Simulación de disponibilidad por fechas
  private generateMockAvailability(startDate: Date, endDate: Date): DateAvailability[] {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    console.log("Generated days:", days);
    
    return days.map(date => {
      // Verificar si la fecha está en las fechas reservadas
      const isBooked = this.bookedDates.some(bookedDate => 
        isSameDay(bookedDate, date)
      );
      
      // No permitir reservas en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      const isPastDate = isBefore(date, today);
      
      // Simulamos disponibilidad variable
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const randomFactor = Math.random();
      
      // Los fines de semana tienen menos disponibilidad
      let availableRooms = isWeekend ? Math.floor(randomFactor * 2) + 1 : Math.floor(randomFactor * 3) + 1;
      
      // Si está reservado o es fecha pasada, no hay disponibilidad
      const isAvailable = !isBooked && !isPastDate && availableRooms > 0;
      
      return {
        date: new Date(date), // Crear nueva instancia para evitar referencias
        available: isAvailable,
        availableRooms: isAvailable ? availableRooms : 0,
        minPrice: this.PRICE_PER_NIGHT,
        maxPrice: this.PRICE_PER_NIGHT
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
    
    console.log("Month availability generated:", calendarMonth);
    return of(calendarMonth).pipe(delay(500));
  }

  // Obtener disponibilidad para un rango de fechas
  getDateRangeAvailability(startDate: Date, endDate: Date): Observable<DateAvailability[]> {
    // En un entorno real: return this.http.post<DateAvailability[]>(`${this.apiUrl}/availability/range`, { startDate, endDate });
    
    const availability = this.generateMockAvailability(startDate, endDate);
    return of(availability).pipe(delay(800));
  }

  // Verificar si un rango de fechas está disponible
  checkDateRangeAvailability(checkIn: Date, checkOut: Date, roomId: number): Observable<{available: boolean, totalPrice: number}> {
    return this.apiService.post<any>('reservations/check-availability', {
      checkIn,
      checkOut,
      roomId
    }).pipe(
      map(response => ({
        available: response.data.available,
        totalPrice: response.data.totalPrice
      }))
    );
  }

  createReservation(reservationData: ReservationData): Observable<Reservation> {
    return this.apiService.post<Reservation>('reservations', {
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      guests: reservationData.guests,
      status: reservationData.status || 'pending',
      totalPrice: reservationData.totalPrice,
      customerName: reservationData.customerName,
      customerEmail: reservationData.customerEmail,
      customerPhone: reservationData.customerPhone,
      specialRequests: reservationData.specialRequests,
      room: reservationData.roomId
    }).pipe(
      map(response => response.data as Reservation)
    );
  }

  // Obtener precio por noche
  getPricePerNight(): number {
    return this.PRICE_PER_NIGHT;
  }

  // Simulamos algunas fechas específicas que están ocupadas
  private bookedDates: Date[] = [
    new Date(2025, 4, 28), // 28 de Mayo
    new Date(2025, 4, 29), // 29 de Mayo
    new Date(2025, 5, 15), // 15 de Junio
    new Date(2025, 5, 16), // 16 de Junio
    new Date(2025, 5, 17), // 17 de Junio
  ];

  // Método auxiliar para verificar si una fecha específica está disponible
  isDateAvailable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(date, today)) {
      return false;
    }
    
    return !this.bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  }

  // Método para obtener las fechas ocupadas (útil para debugging)
  getBookedDates(): Date[] {
    return [...this.bookedDates];
  }

  // Obtener todas las reservas
  getReservations(filters?: any): Observable<Reservation[]> {
    return this.apiService.get<Reservation>('reservations', {
      ...filters,
      populate: ['room'], // Incluir información de la habitación
      sort: 'createdAt:desc'
    }).pipe(
      map(response => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [response.data];
      })
    );
  }

  // Obtener una reserva específica
  getReservation(id: number): Observable<Reservation> {
    return this.apiService.getById<Reservation>('reservations', id).pipe(
      map(response => response.data as Reservation)
    );
  }

  // Actualizar estado de una reserva
  updateReservationStatus(id: number, status: string): Observable<Reservation> {
    return this.apiService.put<Reservation>('reservations', id, {
      status: status
    }).pipe(
      map(response => response.data as Reservation)
    );
  }

  // Cancelar una reserva
  cancelReservation(id: number): Observable<Reservation> {
    return this.updateReservationStatus(id, 'cancelled');
  }

  // Obtener reservas por habitación
  getReservationsByRoom(roomId: number): Observable<Reservation[]> {
    return this.getReservations({
      filters: {
        room: {
          id: {
            $eq: roomId
          }
        }
      }
    });
  }

  // Obtener reservas por estado
  getReservationsByStatus(status: string): Observable<Reservation[]> {
    return this.getReservations({
      filters: {
        status: {
          $eq: status
        }
      }
    });
  }

  // Obtener reservas por cliente
  getReservationsByCustomer(email: string): Observable<Reservation[]> {
    return this.getReservations({
      filters: {
        customerEmail: {
          $eq: email
        }
      }
    });
  }
}