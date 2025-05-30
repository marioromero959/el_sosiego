import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationFormComponent } from '../../shared/components/reservation-form/reservation-form.component';
import { ReservationService } from '../../core/services/reservation.service';
import { ReviewService } from '../../core/services/review.service';
import { Room } from '../../core/models/room.model';
import { Review } from '../../core/models/review.model';
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
  reviews: Review[] = [];
  isLoading: boolean = true;
  isLoadingReviews: boolean = true;

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

  constructor(
    private reservationService: ReservationService,
    private reviewService: ReviewService,
    public apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadReviews();
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

  loadReviews(): void {
    this.isLoadingReviews = true;
    this.reviewService.getVerifiedReviews()
      .subscribe({
        next: (data) => {
          this.reviews = data;
          this.isLoadingReviews = false;
        },
        error: (error) => {
          console.error('Error fetching reviews:', error);
          this.isLoadingReviews = false;
        }
      });
  }

  getFirstImageUrl(room: Room): string {
    if (!room.images || room.images.length === 0) {
      return 'assets/images/placeholder.jpg';
    }
    return this.apiService.getImageUrl(room.images[0].url);
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}