import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { Room } from '../../core/models/reservation.model';

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './accommodations.component.html',
  styleUrl: './accommodations.component.scss'
})
export class AccommodationsComponent {
  rooms: Room[] = [];
  isLoading: boolean = true;
  
  // Características comunes de las habitaciones
  commonFeatures = [
    {
      icon: 'fas fa-wifi',
      title: 'Wi-Fi Gratis',
      description: 'Conexión de alta velocidad disponible en todas las habitaciones'
    },
    {
      icon: 'fas fa-thermometer-half',
      title: 'Climatización',
      description: 'Control individual de temperatura en cada habitación'
    },
    {
      icon: 'fas fa-coffee',
      title: 'Café y Té',
      description: 'Set de café y té con hervidor eléctrico'
    },
    {
      icon: 'fas fa-tv',
      title: 'Smart TV',
      description: 'Televisor con canales internacionales y conexión a plataformas de streaming'
    },
    {
      icon: 'fas fa-bath',
      title: 'Amenities de Baño',
      description: 'Productos de baño ecológicos y secador de pelo'
    },
    {
      icon: 'fas fa-concierge-bell',
      title: 'Servicio de Habitación',
      description: 'Disponible de 7:00 a 22:00'
    }
  ];
  
  constructor(private reservationService: ReservationService) { }
  
  ngOnInit(): void {
    this.loadRooms();
  }
  
  loadRooms(): void {
    this.isLoading = true;
    this.reservationService.getRooms()
      .subscribe({
        next: (data) => {
          this.rooms = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching rooms:', error);
          this.isLoading = false;
        }
      });
  }
}