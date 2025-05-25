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
      pricePerNight: 120,
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
      pricePerNight: 180,
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
      pricePerNight: 180,
      size: 50,
      beds: '1 Cama',
      amenities: ['Wi-Fi', 'Escritorio', 'Silla de oficina'],
      images: ['assets/images/gallery/img64.jpeg','assets/images/gallery/img65.jpeg','assets/images/gallery/img66.jpeg','assets/images/gallery/img67.jpeg'],
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