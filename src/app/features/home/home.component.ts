import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationFormComponent } from '../../shared/components/reservation-form/reservation-form.component';
import { ReservationService } from '../../core/services/reservation.service';
import { Room } from '../../core/models/room.model';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReservationFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  rooms: Room[] = [];
  isLoading: boolean = true;

  amenities = [
    {
      icon: 'fa-solid fa-wifi',
      title: 'Wi-Fi Gratis',
      description: 'Conexión satelital Starlink de alta velocidad en toda la propiedad.'
    },
    {
      icon: 'fa-solid fa-water-ladder',
      title: 'Piscina',
      description: 'Disfruta de nuestra piscina con vistas espectaculares.'
    },
    {
      icon: 'fa-solid fa-mug-saucer',
      title: 'Desayuno',
      description: 'Desayuno completo con productos locales y caseros.'
    },
    {
      icon: 'fa-solid fa-fire',
      title: 'Asador',
      description: 'Parrilla disponible para compartir un buen asado de campo.'
    }
  ];

  testimonials = [
    {
      name: 'Jeremias Bizin',
      photo: 'fa-solid fa-j',
      text: 'Hermoso lugar y excelente servicio. Muy atentos los dueños. Muy recomendable.',
      rating: 5
    },
    {
      name: 'Maria Szlafsztein',
      photo: 'fa-solid fa-m',
      text: 'Un lugar maravilloso, fuimos en familia y todos disfrutamos de los encantadores espacios de la  casa y el parque. Super limpia la casa, mucha sombra y una hermosa pileta. Los dueños super atentos a todos los detalles.',
      rating: 5
    },
    {
      name: 'Bianca Bagnati',
      photo: 'fa-solid fa-b',
      text: 'Lugar de ensueño y los dueños siempre pendiente de nuestro bienestar super recomendable! Volveremos.',
      rating: 4
    }
  ];

  constructor(
    private reservationService: ReservationService,
    public apiService: ApiService
  ) {}

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

  getFirstImageUrl(room: Room): string {
    if (!room.images || room.images.length === 0) {
      return 'assets/images/placeholder.jpg';
    }
    return this.apiService.getImageUrl(room.images[0].url);
  }
}