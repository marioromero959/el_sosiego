import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { ReservationData, Room, Availability } from '../models/reservation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = environment.apiUrl;
  
  // Mock data for development
  private mockRooms: Room[] = [
    {
      id: 1,
      name: 'Habitación Estándar',
      type: 'standard',
      description: 'Acogedora habitación con todas las comodidades para una estancia agradable.',
      capacity: 2,
      pricePerNight: 80,
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
      pricePerNight: 120,
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
      pricePerNight: 180,
      size: 50,
      beds: '1 Cama King + 2 Camas Individuales',
      amenities: ['TV', 'Wi-Fi', 'Baño privado', 'Sala de estar', 'Terraza privada', 'Vista panorámica'],
      images: ['assets/images/room3.jpg', 'assets/images/room3-2.jpg'],
      available: true
    }
  ];

  constructor(private http: HttpClient) { }

  // En un entorno real, esto se conectaría a un backend
  getRooms(): Observable<Room[]> {
    // return this.http.get<Room[]>(`${this.apiUrl}/rooms`);
    return of(this.mockRooms).pipe(delay(800)); // Simular latencia
  }

  getRoom(id: number): Observable<Room> {
    // return this.http.get<Room>(`${this.apiUrl}/rooms/${id}`);
    const room = this.mockRooms.find(r => r.id === id);
    return of(room as Room).pipe(delay(500)); // Simular latencia
  }

  checkAvailability(checkIn: Date, checkOut: Date, guests: number): Observable<Room[]> {
    // En un entorno real, aquí consultaríamos la disponibilidad real
    // return this.http.post<Room[]>(`${this.apiUrl}/availability`, { checkIn, checkOut, guests });
    
    // Simulamos disponibilidad para desarrollo
    const availableRooms = this.mockRooms.filter(room => room.capacity >= guests);
    return of(availableRooms).pipe(delay(1000)); // Simular latencia
  }

  createReservation(reservation: ReservationData): Observable<ReservationData> {
    // En un entorno real: return this.http.post<ReservationData>(`${this.apiUrl}/reservations`, reservation);
    
    // Simulamos la creación de una reserva
    const newReservation: ReservationData = {
      ...reservation,
      id: Math.floor(Math.random() * 1000) + 1,
      status: 'confirmed',
      createdAt: new Date()
    };
    
    return of(newReservation).pipe(delay(1200)); // Simular latencia
  }

  // Ya no necesitamos este método custom delay porque usamos el operador delay de RxJS
  /* 
  private delay(ms: number) {
    return (observable: Observable<any>) => 
      new Observable(observer => {
        const subscription = observable.subscribe({
          next: value => {
            setTimeout(() => observer.next(value), ms);
          },
          error: error => {
            setTimeout(() => observer.error(error), ms);
          },
          complete: () => {
            setTimeout(() => observer.complete(), ms);
          }
        });
        
        return () => subscription.unsubscribe();
      });
  }
  */
}