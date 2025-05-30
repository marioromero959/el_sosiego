import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GalleryService } from '../../services/gallery.service';
import { Gallery } from '../../models/gallery.model';

interface GalleryImage {
  src: string;
  thumb: string;
  alt: string;
}

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  featured: boolean;
  images: GalleryImage[];
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit, OnDestroy {
  // Categorías para filtrar las imágenes
  categories = [
    { id: 'all', name: 'Todas' },
    { id: 'rooms', name: 'Habitaciones' },
    { id: 'exterior', name: 'Exteriores' },
    { id: 'pool', name: 'Piscina' },
    { id: 'kitchen', name: 'Cocina' },
    { id: 'bathroom', name: 'Baños' }
  ];

  // Variables para el control de la galería
  galleryItems: GalleryItem[] = [];
  selectedCategory: string = 'all';
  filteredItems: GalleryItem[] = [];
  lightboxActive: boolean = false;
  currentItem: GalleryItem | null = null;
  currentImageIndex: number = 0;
  isLoading = true;
  error: string | null = null;

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.loadGalleries();
  }

  ngOnDestroy(): void {
    // Limpiar eventos y restaurar scroll si es necesario
    if (this.lightboxActive) {
      document.body.style.overflow = '';
    }
  }

  private loadGalleries() {
    this.isLoading = true;
    this.error = null;
    
    this.galleryService.getGalleries().subscribe({
      next: (galleries) => {
        console.log('Received galleries:', galleries);
        // Convertir las galerías de la API al formato de GalleryItem
        this.galleryItems = galleries.map(gallery => ({
          id: gallery.id,
          title: gallery.name,
          category: gallery.category,
          featured: false,
          images: gallery.images.map(imageUrl => ({
            src: imageUrl,
            thumb: imageUrl,
            alt: gallery.name
          }))
        }));
        this.filterItems('all');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading galleries:', error);
        this.error = 'Error al cargar las galerías. Por favor, intente más tarde.';
        this.isLoading = false;
      }
    });
  }

  // Método para filtrar items por categoría
  filterItems(category: string): void {
    this.selectedCategory = category;
    
    if (category === 'all') {
      this.filteredItems = [...this.galleryItems];
    } else {
      this.filteredItems = this.galleryItems.filter(item => item.category === category);
    }
  }

  // Métodos para el control del lightbox
  openLightbox(item: GalleryItem, imageIndex: number = 0): void {
    this.currentItem = item;
    this.currentImageIndex = imageIndex;
    this.lightboxActive = true;
    // Bloquear el scroll del body cuando el lightbox está activo
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxActive = false;
    this.currentItem = null;
    this.currentImageIndex = 0;
    // Restaurar el scroll del body
    document.body.style.overflow = '';
  }

  navigateLightbox(direction: number): void {
    if (!this.currentItem || this.currentItem.images.length <= 1) return;
    
    this.currentImageIndex += direction;
    
    // Navegación circular
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.currentItem.images.length - 1;
    } else if (this.currentImageIndex >= this.currentItem.images.length) {
      this.currentImageIndex = 0;
    }
  }

  // Ir directamente a una imagen específica del item actual
  goToImage(imageIndex: number): void {
    if (!this.currentItem) return;
    this.currentImageIndex = imageIndex;
  }

  // Obtener la imagen actual
  getCurrentImage(): GalleryImage | null {
    if (!this.currentItem || !this.currentItem.images[this.currentImageIndex]) {
      return null;
    }
    return this.currentItem.images[this.currentImageIndex];
  }

  // Obtener el total de imágenes del item actual
  getTotalImages(): number {
    return this.currentItem ? this.currentItem.images.length : 0;
  }

  // Manejador de eventos de teclado global
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.lightboxActive) return;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeLightbox();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        event.preventDefault();
        this.navigateLightbox(-1);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        event.preventDefault();
        this.navigateLightbox(1);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.navigateLightbox(1);
        break;
    }
  }
}