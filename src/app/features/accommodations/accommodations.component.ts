import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class AccommodationsComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  isLoading: boolean = true;
  
  // Estado del slider - arrays simples para evitar problemas de tipado
  currentImageIndex: number[] = [];
  autoSlideIntervals: any[] = [];
  
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

  ngOnDestroy(): void {
    // Limpiar todos los intervalos
    for (let i = 0; i < this.autoSlideIntervals.length; i++) {
      if (this.autoSlideIntervals[i]) {
        clearInterval(this.autoSlideIntervals[i]);
      }
    }
  }

  loadRooms(): void {
    this.isLoading = true;
    this.reservationService.getRooms()
      .subscribe({
        next: (data) => {
          this.rooms = data;
          this.isLoading = false;
          this.initializeSliders();
        },
        error: (error) => {
          console.error('Error fetching rooms:', error);
          this.isLoading = false;
        }
      });
  }

  private initializeSliders(): void {
    // Inicializar arrays del tamaño correcto
    this.currentImageIndex = [];
    this.autoSlideIntervals = [];

    for (let i = 0; i < this.rooms.length; i++) {
      this.currentImageIndex[i] = 0;
      this.autoSlideIntervals[i] = null;
      
      // Iniciar auto-slide si hay múltiples imágenes
      const room = this.rooms[i];
      if (room.images && room.images.length > 1) {
        this.startAutoSlide(i, room.images.length);
      }
    }
  }

  private startAutoSlide(roomIndex: number, imageCount: number): void {
    this.autoSlideIntervals[roomIndex] = setInterval(() => {
      this.nextImage(roomIndex, imageCount);
    }, 4000);
  }

  private stopAutoSlide(roomIndex: number): void {
    if (this.autoSlideIntervals[roomIndex]) {
      clearInterval(this.autoSlideIntervals[roomIndex]);
      this.autoSlideIntervals[roomIndex] = null;
    }
  }

  // Métodos públicos para el template
  nextImage(roomIndex: number, imageCount: number): void {
    const current = this.currentImageIndex[roomIndex] || 0;
    this.currentImageIndex[roomIndex] = (current + 1) % imageCount;
  }

  prevImage(roomIndex: number, imageCount: number): void {
    const current = this.currentImageIndex[roomIndex] || 0;
    this.currentImageIndex[roomIndex] = current === 0 ? imageCount - 1 : current - 1;
  }

  goToImage(roomIndex: number, imageIndex: number): void {
    this.currentImageIndex[roomIndex] = imageIndex;
  }

  getCurrentImageIndex(roomIndex: number): number {
    return this.currentImageIndex[roomIndex] || 0;
  }

  onSliderMouseEnter(roomIndex: number): void {
    this.stopAutoSlide(roomIndex);
  }

  onSliderMouseLeave(roomIndex: number, imageCount: number): void {
    if (imageCount > 1) {
      this.startAutoSlide(roomIndex, imageCount);
    }
  }

  onKeyDown(event: KeyboardEvent, roomIndex: number, imageCount: number): void {
    if (imageCount <= 1) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.prevImage(roomIndex, imageCount);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage(roomIndex, imageCount);
        break;
    }
  }
}