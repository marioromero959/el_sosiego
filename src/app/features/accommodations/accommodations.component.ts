import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { Room } from '../../core/models/room.model';
import { ReservationData } from '../../core/models/reservation.model';
import { ApiService } from '../../core/services/api.service';

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
  
  // Estado del modal de pantalla completa
  isFullscreenOpen: boolean = false;
  fullscreenRoomIndex: number = 0;
  fullscreenImageIndex: number = 0;
  fullscreenAutoSlideInterval: any = null;
  
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
    // {
    //   icon: 'fas fa-coffee',
    //   title: 'Café y Té',
    //   description: 'Set de café y té con hervidor eléctrico'
    // },
    // {
    //   icon: 'fas fa-tv',
    //   title: 'Smart TV',
    //   description: 'Televisor con canales internacionales y conexión a plataformas de streaming'
    // },
    // {
    //   icon: 'fas fa-bath',
    //   title: 'Amenities de Baño',
    //   description: 'Productos de baño ecológicos y secador de pelo'
    // },
    {
      icon: 'fas fa-bed',
      title: 'Servicio de Mantas',
      description: 'Mantas y acolchados a disponibilidad'
    }
  ];

  constructor(
    private reservationService: ReservationService,
    public apiService: ApiService
  ) { }

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
    // Limpiar intervalo del modal
    if (this.fullscreenAutoSlideInterval) {
      clearInterval(this.fullscreenAutoSlideInterval);
    }
    // Remover event listener del teclado
    document.removeEventListener('keydown', this.handleKeyboardEvents.bind(this));
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

  // === MÉTODOS PARA MODAL DE PANTALLA COMPLETA ===

  openFullscreen(roomIndex: number, imageIndex: number = 0): void {
    this.isFullscreenOpen = true;
    this.fullscreenRoomIndex = roomIndex;
    this.fullscreenImageIndex = imageIndex;
    
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.handleKeyboardEvents.bind(this));
    
    const room = this.rooms[roomIndex];
    if (room.images && room.images.length > 1) {
      this.startFullscreenAutoSlide();
    }
  }

  closeFullscreen(): void {
    this.isFullscreenOpen = false;
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
    
    // Remover event listener del teclado
    document.removeEventListener('keydown', this.handleKeyboardEvents.bind(this));
    
    // Detener auto-slide del modal
    this.stopFullscreenAutoSlide();
  }

  private handleKeyboardEvents(event: KeyboardEvent): void {
    if (!this.isFullscreenOpen) return;

    const room = this.rooms[this.fullscreenRoomIndex];
    const imageCount = this.getImageCount(room);

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeFullscreen();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.fullscreenPrevImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.fullscreenNextImage();
        break;
    }
  }

  fullscreenNextImage(): void {
    const room = this.rooms[this.fullscreenRoomIndex];
    const imageCount = this.getImageCount(room);
    if (imageCount <= 1) return;
    
    this.fullscreenImageIndex = (this.fullscreenImageIndex + 1) % imageCount;
    this.resetFullscreenAutoSlide();
  }

  fullscreenPrevImage(): void {
    const room = this.rooms[this.fullscreenRoomIndex];
    const imageCount = this.getImageCount(room);
    if (imageCount <= 1) return;
    
    this.fullscreenImageIndex = this.fullscreenImageIndex === 0 
      ? imageCount - 1 
      : this.fullscreenImageIndex - 1;
    this.resetFullscreenAutoSlide();
  }

  goToFullscreenImage(imageIndex: number): void {
    this.fullscreenImageIndex = imageIndex;
    this.resetFullscreenAutoSlide();
  }

  private startFullscreenAutoSlide(): void {
    this.fullscreenAutoSlideInterval = setInterval(() => {
      this.fullscreenNextImage();
    }, 5000); // 5 segundos en fullscreen
  }

  private stopFullscreenAutoSlide(): void {
    if (this.fullscreenAutoSlideInterval) {
      clearInterval(this.fullscreenAutoSlideInterval);
      this.fullscreenAutoSlideInterval = null;
    }
  }

  private resetFullscreenAutoSlide(): void {
    this.stopFullscreenAutoSlide();
    const room = this.rooms[this.fullscreenRoomIndex];
    if (room.images && room.images.length > 1) {
      this.startFullscreenAutoSlide();
    }
  }

  onFullscreenMouseEnter(): void {
    this.stopFullscreenAutoSlide();
  }

  onFullscreenMouseLeave(): void {
    const room = this.rooms[this.fullscreenRoomIndex];
    if (room.images && room.images.length > 1) {
      this.startFullscreenAutoSlide();
    }
  }

  // Cerrar modal al hacer click en el overlay (fuera de la imagen)
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeFullscreen();
    }
  }

  getReservations(): void {
    this.reservationService.getReservations().subscribe(
      reservations => {
        console.log('Todas las reservas:', reservations);
      }
    );
  }

  getReservationsByStatus(): void {
    this.reservationService.getReservationsByStatus('confirmed').subscribe(
      reservations => {
        console.log('Reservas confirmadas:', reservations);
      }
    );
  }

  getReservationsByRoom(): void {
    this.reservationService.getReservationsByRoom(1).subscribe(
      reservations => {
        console.log('Reservas de la habitación 1:', reservations);
      }
    );
  }

  getReservationsByCustomer(): void {
    this.reservationService.getReservationsByCustomer('cliente@email.com').subscribe(
      reservations => {
        console.log('Reservas del cliente:', reservations);
      }
    );
  }

  createReservation(): void {
    const newReservation: ReservationData = {
      checkIn: new Date('2024-04-01'),
      checkOut: new Date('2024-04-03'),
      guests: 2,
      totalPrice: 400,
      customerName: 'Juan Pérez',
      customerEmail: 'juan@email.com',
      customerPhone: '123456789',
      roomId: 1
    };

    this.reservationService.createReservation(newReservation).subscribe(
      reservation => {
        console.log('Reserva creada:', reservation);
      }
    );
  }

  getImageUrl(room: Room, imageIndex: number): string {
    if (!room.images || !room.images[imageIndex]) {
      return 'assets/images/placeholder.jpg';
    }
    return this.apiService.getImageUrl(room.images[imageIndex].url);
  }

  getImageCount(room: Room): number {
    return room.images?.length || 0;
  }
}