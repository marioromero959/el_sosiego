import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { ReservationData, Room, DateAvailability, CalendarMonth } from '../models/reservation.model';
import { environment } from '../../../environments/environment';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, differenceInDays, isBefore, isAfter, isSameDay } from 'date-fns';

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
      size: 35,
      beds: '2 Camas',
      amenities: ['Wi-Fi', 'Baño compartido', 'Vista al jardín'],
      images: ['assets/images/gallery/img83.jpeg', 'assets/images/gallery/img84.jpeg', 'assets/images/gallery/img89.jpeg', 'assets/images/gallery/img90.jpeg', 'assets/images/gallery/img91.jpeg'],
      available: true
    },
    {
      id: 2,
      name: 'Habitación Superior',
      type: 'superior',
      description: 'Agradable habitación con todas las comodidades para sentirse como en casa.',
      capacity: 2,
      pricePerNight: this.PRICE_PER_NIGHT,
      size: 35,
      beds: '2 Camas',
      amenities: ['Wi-Fi', 'Baño compartido', 'Vista al jardín'],
      images: ['assets/images/gallery/img85.jpeg', 'assets/images/gallery/img86.jpeg', 'assets/images/gallery/img87.jpeg', 'assets/images/gallery/img88.jpeg'],
      available: true
    },
    {
      id: 3,
      name: 'Suite Matrimonial',
      type: 'family',
      description: 'Perfecta para familias, con amplios espacios y todas las comodidades.',
      capacity: 2,
      pricePerNight: this.PRICE_PER_NIGHT,
      size: 50,
      beds: '1 Cama King',
      amenities: ['Wi-Fi', 'Baño privado', 'Sala de estar'],
      images: ['assets/images/gallery/img98.jpeg', 'assets/images/gallery/img99.jpeg', 'assets/images/gallery/img100.jpeg'],
      available: true
    },
    {
      id: 4,
      name: 'Oficina',
      type: 'oficina',
      description: 'Ambiente profesional y confortable, ideal para enfocarte en tus proyectos.',
      capacity: 1,
      pricePerNight: this.PRICE_PER_NIGHT,
      size: 50,
      beds: '1 Cama',
      amenities: ['Wi-Fi', 'Escritorio', 'Silla de oficina'],
      images: ['assets/images/gallery/img64.jpeg','assets/images/gallery/img65.jpeg','assets/images/gallery/img66.jpeg','assets/images/gallery/img67.jpeg'],
      available: true
    }
  ];

  // Simulamos algunas fechas específicas que están ocupadas
  private bookedDates: Date[] = [
    new Date(2025, 4, 28), // 28 de Mayo
    new Date(2025, 4, 29), // 29 de Mayo
    new Date(2025, 5, 15), // 15 de Junio
    new Date(2025, 5, 16), // 16 de Junio
    new Date(2025, 5, 17), // 17 de Junio
  ];

  constructor(private http: HttpClient) { }

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
  checkDateRangeAvailability(checkIn: Date, checkOut: Date, guests: number): Observable<{available: boolean, totalPrice: number}> {
    // En un entorno real: return this.http.post<any>(`${this.apiUrl}/check-availability`, { checkIn, checkOut, guests });
    
    console.log("Checking availability from", checkIn, "to", checkOut, "for", guests, "guests");
    
    // Generar disponibilidad para el rango incluyendo la fecha de checkout para la verificación
    const availability = this.generateMockAvailability(checkIn, checkOut);
    console.log("Generated availability:", availability);
    
    // Verificar disponibilidad solo para las fechas de estadía (sin incluir checkout)
    // El checkout no necesita estar disponible ya que el huésped se va ese día
    const stayDates = availability.slice(0, -1); // Remover el último día (checkout)
    console.log("Stay dates to check:", stayDates);
    
    // Verificar que todas las fechas de estadía estén disponibles
    const allDaysAvailable = stayDates.every(day => {
      const dayAvailable = day.available && day.availableRooms >= Math.ceil(guests / 2);
      console.log(`Day ${day.date.toDateString()}: available=${day.available}, rooms=${day.availableRooms}, needed=${Math.ceil(guests / 2)}, result=${dayAvailable}`);
      return dayAvailable;
    });
    
    // Calcular precio total basado en las noches de estadía
    const nights = differenceInDays(checkOut, checkIn);
    const totalPrice = allDaysAvailable ? (nights * this.PRICE_PER_NIGHT) : 0;
    
    console.log(`Availability check result: available=${allDaysAvailable}, nights=${nights}, totalPrice=${totalPrice}`);
    
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
    
    // Simular agregar las fechas a las reservadas
    if (reservation.checkIn && reservation.checkOut) {
      const reservedDates = eachDayOfInterval({ 
        start: reservation.checkIn, 
        end: addDays(reservation.checkOut, -1) // No incluir el día de checkout
      });
      this.bookedDates.push(...reservedDates);
    }
    
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
}