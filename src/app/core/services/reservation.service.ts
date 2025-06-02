import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, map, catchError, tap, delay, throwError } from 'rxjs';
import { ReservationData, DateAvailability, CalendarMonth, Reservation } from '../models/reservation.model';
import { Room } from '../models/room.model';
import { environment } from '../../../environments/environment';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, differenceInDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { ApiService, StrapiResponse } from './api.service';

// Nuevas interfaces para la funcionalidad extendida
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

export interface CreateReservationResponse {
  success: boolean;
  reservation?: Reservation;
  message?: string;
  confirmationCode?: string;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  totalPrice: number;
  message?: string;
  conflictingDates?: string[];
}

export interface ReservationLookupResponse {
  success: boolean;
  reservation?: any; // Usar any para manejar ambas estructuras
  message?: string;
}

export interface EmailResendResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = environment.apiUrl;
  private readonly PRICE_PER_NIGHT = 50000; // Precio en pesos colombianos
  
  constructor(private http: HttpClient, private apiService: ApiService) { }

  // ========================================
  // MÉTODOS EXISTENTES (MANTENIDOS PARA COMPATIBILIDAD)
  // ========================================

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

  // Simulación de fechas ocupadas (mantenida para compatibilidad)
  private bookedDates: Date[] = [
    new Date(2025, 4, 28), // 28 de Mayo
    new Date(2025, 4, 29), // 29 de Mayo
    new Date(2025, 5, 15), // 15 de Junio
    new Date(2025, 5, 16), // 16 de Junio
    new Date(2025, 5, 17), // 17 de Junio
  ];

  // Simulación de disponibilidad por fechas (mantenida para compatibilidad)
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

  // Obtener disponibilidad para un rango de fechas (mantenida)
  getDateRangeAvailability(startDate: Date, endDate: Date): Observable<DateAvailability[]> {
    const availability = this.generateMockAvailability(startDate, endDate);
    return of(availability).pipe(delay(800));
  }

  // Método original para crear reservas (mantenido para compatibilidad)
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

  // Obtener todas las reservas (mantenido)
  getReservations(filters?: any): Observable<Reservation[]> {
    return this.apiService.get<Reservation>('reservations', {
      ...filters,
      populate: ['room'],
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

  // Obtener una reserva específica (mantenido)
  getReservation(id: number): Observable<Reservation> {
    return this.apiService.getById<Reservation>('reservations', id).pipe(
      map(response => response.data as Reservation)
    );
  }

  // Actualizar estado de una reserva (mantenido)
  updateReservationStatus(id: number, status: string): Observable<Reservation> {
    return this.apiService.put<Reservation>('reservations', id, {
      status: status
    }).pipe(
      map(response => response.data as Reservation)
    );
  }

  // Cancelar una reserva (mantenido)
  cancelReservation(id: number): Observable<Reservation> {
    return this.updateReservationStatus(id, 'cancelled');
  }

  // Obtener reservas por habitación (mantenido)
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

  // Obtener reservas por estado (mantenido)
  getReservationsByStatus(status: string): Observable<Reservation[]> {
    return this.getReservations({
      filters: {
        status: {
          $eq: status
        }
      }
    });
  }

  // Obtener reservas por cliente (mantenido)
  getReservationsByCustomer(email: string): Observable<Reservation[]> {
    return this.getReservations({
      filters: {
        customerEmail: {
          $eq: email
        }
      }
    });
  }

  // Método auxiliar para verificar si una fecha específica está disponible (mantenido)
  isDateAvailable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(date, today)) {
      return false;
    }
    
    return !this.bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  }

  // Método para obtener las fechas ocupadas (mantenido)
  getBookedDates(): Date[] {
    return [...this.bookedDates];
  }

  // ========================================
  // NUEVOS MÉTODOS PARA FUNCIONALIDAD EXTENDIDA
  // ========================================

  /**
   * Crear una nueva reserva con la nueva estructura
   */
  createReservationNew(reservationData: CreateReservationData): Observable<CreateReservationResponse> {
    console.log('🚀 Creating reservation with data:', reservationData);
    
    // Formatear los datos para que coincidan con el backend
    const formattedData = {
      name: reservationData.name,
      email: reservationData.email,
      phone: reservationData.phone,
      checkIn: format(reservationData.checkIn, 'yyyy-MM-dd'),
      checkOut: format(reservationData.checkOut, 'yyyy-MM-dd'),
      guests: reservationData.guests,
      specialRequests: reservationData.specialRequests || '',
      totalPrice: reservationData.totalPrice,
      statusReservation: 'confirmed'
    };

    console.log('📤 Sending formatted data to backend:', formattedData);

    return this.http.post<any>(`${this.apiUrl}/reservations`, { data: formattedData })
      .pipe(
        map(response => {
          console.log('✅ Reservation created successfully:', response);
          
          return {
            success: true,
            reservation: response.data,
            confirmationCode: response.data?.confirmationCode,
            message: 'Reserva creada exitosamente'
          };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Verificar disponibilidad de fechas (nueva implementación)
   */
  checkDateRangeAvailability(checkIn: Date, checkOut: Date, guests: number): Observable<AvailabilityCheckResponse> {
    console.log('🔍 Checking availability for:', { checkIn, checkOut, guests });
    
    const requestData = {
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      guests: guests
    };

    console.log('📤 Sending availability check:', requestData);

    return this.http.post<any>(`${this.apiUrl}/reservations/check-availability`, requestData)
      .pipe(
        map(response => {
          console.log('✅ Availability check response:', response);
          
          // Acceder a los datos desde response.data
          const data = response.data || response;
          
          // Calcular precio total si no viene del backend
          let totalPrice = data.totalPrice || 0;
          if (!totalPrice && data.available) {
            const nights = differenceInDays(new Date(data.checkOut), new Date(data.checkIn));
            totalPrice = nights * this.PRICE_PER_NIGHT;
          }
          
          return {
            available: data.available === true, // Asegurar que sea boolean
            totalPrice: totalPrice,
            message: data.message || (data.available ? 'Fechas disponibles' : 'Fechas no disponibles'),
            conflictingDates: data.conflictingDates || []
          };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Buscar reserva por código de confirmación
   */
  findByConfirmationCode(confirmationCode: string): Observable<ReservationLookupResponse> {
    console.log('🔍 Looking up reservation with code:', confirmationCode);
    
    return this.http.get<any>(`${this.apiUrl}/reservations/by-code/${confirmationCode}`)
      .pipe(
        map(response => {
          console.log('✅ Reservation lookup response:', response);
          
          if (response.data) {
            // Convertir fechas string a Date objects
            const reservation = {
              ...response.data,
              checkIn: new Date(response.data.checkIn),
              checkOut: new Date(response.data.checkOut),
              createdAt: response.data.createdAt ? new Date(response.data.createdAt) : undefined,
              updatedAt: response.data.updatedAt ? new Date(response.data.updatedAt) : undefined,
              emailSentAt: response.data.emailSentAt ? new Date(response.data.emailSentAt) : undefined
            };

            return {
              success: true,
              reservation: reservation,
              message: 'Reserva encontrada'
            };
          } else {
            return {
              success: false,
              message: 'No se encontró ninguna reserva con ese código'
            };
          }
        }),
        catchError(error => {
          console.error('❌ Error looking up reservation:', error);
          
          if (error.status === 404) {
            return throwError(() => ({
              success: false,
              message: 'No se encontró ninguna reserva con ese código de confirmación'
            }));
          }
          
          return this.handleError(error);
        })
      );
  }

  /**
   * Reenviar email de confirmación
   */
  sendConfirmationEmail(reservationId: number): Observable<EmailResendResponse> {
    console.log('📧 Resending confirmation email for reservation:', reservationId);
    
    return this.http.post<any>(`${this.apiUrl}/reservations/${reservationId}/send-confirmation`, {})
      .pipe(
        map(response => {
          console.log('✅ Email resend response:', response);
          
          return {
            success: response.success || false,
            message: response.message || 'Email reenviado correctamente',
            emailSent: response.emailSent
          };
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Obtener disponibilidad de un mes para el calendario (actualizada)
   */
  getMonthAvailability(year: number, month: number): Observable<CalendarMonth> {
    console.log('📅 Getting month availability for:', { year, month });
    
    // Primero intentar obtener del backend
    return this.http.get<any>(`${this.apiUrl}/reservations/calendar/${year}/${month}`)
      .pipe(
        map(response => {
          console.log('✅ Month availability response from backend:', response);
          
          // La respuesta viene en response.data
          const calendarData = response.data;
          
          if (!calendarData || !calendarData.days) {
            throw new Error('Invalid calendar data from backend');
          }
          
          // Convertir las fechas string a Date objects y mapear correctamente
          const days: DateAvailability[] = calendarData.days.map((day: any) => ({
            ...day,
            date: day.date // Keep the date as string, it will be converted in the component
          }));

          const result: CalendarMonth = {
            year: calendarData.year || year,
            month: calendarData.month || month,
            days: days
          };
          
          console.log('✅ Mapped calendar data:', {
            year: result.year,
            month: result.month,
            totalDays: result.days.length,
            availableDays: result.days.filter(d => d.available).length
          });

          return result;
        }),
        catchError(error => {
          console.warn('⚠️ Backend calendar endpoint failed, using mock data:', error.status || error.message);
          
          // Fallback a datos simulados
          const monthStart = startOfMonth(new Date(year, month - 1));
          const monthEnd = endOfMonth(new Date(year, month - 1));
          
          const availability = this.generateMockAvailability(monthStart, monthEnd);
          
          const calendarMonth: CalendarMonth = {
            year: year,
            month: month,
            days: availability
          };
          
          console.log("✅ Using mock month availability:", {
            year: calendarMonth.year,
            month: calendarMonth.month,
            totalDays: calendarMonth.days.length,
            availableDays: calendarMonth.days.filter(d => d.available).length
          });
          
          return of(calendarMonth);
        })
      );
  }

  // ========================================
  // MÉTODOS AUXILIARES Y UTILIDADES
  // ========================================

  /**
   * Obtener precio por noche
   */
  getPricePerNight(): number {
    return this.PRICE_PER_NIGHT;
  }

  /**
   * Calcular precio total
   */
  calculateTotalPrice(checkIn: Date, checkOut: Date): number {
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights * this.PRICE_PER_NIGHT;
  }

  /**
   * Formatear número como moneda colombiana
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Generar URL de WhatsApp
   */
  generateWhatsAppUrl(reservation: any): string {
    const whatsappNumber = '573213456789'; // Reemplazar con tu número
    const message = `Hola! Quiero consultar sobre mi reserva ${reservation.confirmationCode}. 
Check-in: ${format(reservation.checkIn, 'dd/MM/yyyy')}
Check-out: ${format(reservation.checkOut, 'dd/MM/yyyy')}
Huéspedes: ${reservation.guests}`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }

  /**
   * Manejo de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ API Error:', error);
    
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.error?.message || 'Datos inválidos';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.error?.message || 'Las fechas seleccionadas no están disponibles';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Por favor, intenta más tarde';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.error?.message || error.message}`;
      }
    }
    
    console.error('Final error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}