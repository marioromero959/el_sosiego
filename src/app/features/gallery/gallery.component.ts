import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  // Categorías para filtrar las imágenes
  categories = [
    { id: 'all', name: 'Todas' },
    { id: 'rooms', name: 'Habitaciones' },
    { id: 'exterior', name: 'Exteriores' },
    { id: 'pool', name: 'Piscina' },
    { id: 'dining', name: 'Restaurante' },
    { id: 'activities', name: 'Actividades' }
  ];
  
  // Array con todas las imágenes de la galería
  images = [
    {
      id: 1,
      src: 'assets/images/gallery/room1.jpg',
      thumb: 'assets/images/gallery/thumbs/room1.jpg',
      alt: 'Habitación Estándar',
      category: 'rooms',
      featured: true
    },
    {
      id: 2,
      src: 'assets/images/gallery/room2.jpg',
      thumb: 'assets/images/gallery/thumbs/room2.jpg',
      alt: 'Habitación Superior',
      category: 'rooms',
      featured: false
    },
    {
      id: 3,
      src: 'assets/images/gallery/room3.jpg',
      thumb: 'assets/images/gallery/thumbs/room3.jpg',
      alt: 'Suite Familiar',
      category: 'rooms',
      featured: true
    },
    {
      id: 4,
      src: 'assets/images/gallery/exterior1.jpg',
      thumb: 'assets/images/gallery/thumbs/exterior1.jpg',
      alt: 'Fachada Principal',
      category: 'exterior',
      featured: true
    },
    {
      id: 5,
      src: 'assets/images/gallery/exterior2.jpg',
      thumb: 'assets/images/gallery/thumbs/exterior2.jpg',
      alt: 'Jardines',
      category: 'exterior',
      featured: false
    },
    {
      id: 6,
      src: 'assets/images/gallery/pool1.jpg',
      thumb: 'assets/images/gallery/thumbs/pool1.jpg',
      alt: 'Piscina Exterior',
      category: 'pool',
      featured: true
    },
    {
      id: 7,
      src: 'assets/images/gallery/pool2.jpg',
      thumb: 'assets/images/gallery/thumbs/pool2.jpg',
      alt: 'Zona de Relax',
      category: 'pool',
      featured: false
    },
    {
      id: 8,
      src: 'assets/images/gallery/dining1.jpg',
      thumb: 'assets/images/gallery/thumbs/dining1.jpg',
      alt: 'Restaurante',
      category: 'dining',
      featured: true
    },
    {
      id: 9,
      src: 'assets/images/gallery/dining2.jpg',
      thumb: 'assets/images/gallery/thumbs/dining2.jpg',
      alt: 'Buffet Desayuno',
      category: 'dining',
      featured: false
    },
    {
      id: 10,
      src: 'assets/images/gallery/activities1.jpg',
      thumb: 'assets/images/gallery/thumbs/activities1.jpg',
      alt: 'Senderismo',
      category: 'activities',
      featured: false
    },
    {
      id: 11,
      src: 'assets/images/gallery/activities2.jpg',
      thumb: 'assets/images/gallery/thumbs/activities2.jpg',
      alt: 'Montar a Caballo',
      category: 'activities',
      featured: true
    },
    {
      id: 12,
      src: 'assets/images/gallery/exterior3.jpg',
      thumb: 'assets/images/gallery/thumbs/exterior3.jpg',
      alt: 'Vistas Panorámicas',
      category: 'exterior',
      featured: false
    }
  ];
  
  // Variables para el control de la galería
  selectedCategory: string = 'all';
  filteredImages = [...this.images];
  lightboxActive: boolean = false;
  currentImage: any = null;
  
  // Método para filtrar imágenes por categoría
  filterImages(category: string) {
    this.selectedCategory = category;
    
    if (category === 'all') {
      this.filteredImages = [...this.images];
    } else {
      this.filteredImages = this.images.filter(image => image.category === category);
    }
  }
  
  // Métodos para el control del lightbox
  openLightbox(image: any) {
    this.currentImage = image;
    this.lightboxActive = true;
    // Bloquear el scroll del body cuando el lightbox está activo
    document.body.style.overflow = 'hidden';
  }
  
  closeLightbox() {
    this.lightboxActive = false;
    // Restaurar el scroll del body
    document.body.style.overflow = 'auto';
  }
  
  navigateLightbox(direction: number) {
    const currentIndex = this.filteredImages.findIndex(img => img.id === this.currentImage.id);
    let newIndex = currentIndex + direction;
    
    // Asegurar que el índice esté dentro de los límites
    if (newIndex < 0) {
      newIndex = this.filteredImages.length - 1;
    } else if (newIndex >= this.filteredImages.length) {
      newIndex = 0;
    }
    
    this.currentImage = this.filteredImages[newIndex];
  }
  
  // Manejador de eventos de teclado para el lightbox
  handleKeydown(event: KeyboardEvent) {
    if (!this.lightboxActive) return;
    
    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        this.navigateLightbox(-1);
        break;
      case 'ArrowRight':
        this.navigateLightbox(1);
        break;
    }
  }
}