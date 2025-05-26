import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Interface para las imágenes individuales
interface GalleryImage {
  src: string;
  thumb: string;
  alt: string;
}

// Interface para los items de la galería
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

  // Array con todos los items de la galería (cada item puede tener múltiples imágenes)
  galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: 'Habitación Estándar',
      category: 'rooms',
      featured: true,
      images: [
        {
          src: 'assets/images/gallery/img12.jpeg',
          thumb: 'assets/images/gallery/img12.jpeg',
          alt: 'Habitación Estándar - Vista general'
        },
        {
          src: 'assets/images/gallery/img13.jpeg',
          thumb: 'assets/images/gallery/img13.jpeg',
          alt: 'Habitación Estándar - Baño'
        },
        {
          src: 'assets/images/gallery/img14.jpeg',
          thumb: 'assets/images/gallery/img14.jpeg',
          alt: 'Habitación Estándar - Vista desde la ventana'
        },
        {
          src: 'assets/images/gallery/img15.jpeg',
          thumb: 'assets/images/gallery/img15.jpeg',
          alt: 'Habitación Estándar - Vista desde la ventana'
        }
      ]
    },
    {
      id: 2,
      title: 'Habitación Superior',
      category: 'rooms',
      featured: false,
      images: [
        {
          src: 'assets/images/gallery/img89.jpeg',
          thumb: 'assets/images/gallery/img89.jpeg',
          alt: 'Habitación Superior - Cama principal'
        },
        {
          src: 'assets/images/gallery/img90.jpeg',
          thumb: 'assets/images/gallery/img90.jpeg',
          alt: 'Habitación Superior - Área de estar'
        }
      ]
    },
    {
      id: 3,
      title: 'Suite Matrimonial',
      category: 'rooms',
      featured: true,
      images: [
        {
          src: 'assets/images/gallery/img1.jpeg',
          thumb: 'assets/images/gallery/img1.jpeg',
          alt: 'Suite Matrimonial - Dormitorio'
        },
        {
          src: 'assets/images/gallery/img98.jpeg',
          thumb: 'assets/images/gallery/img98.jpeg',
          alt: 'Suite Matrimonial - Sala de estar'
        },
        {
          src: 'assets/images/gallery/img99.jpeg',
          thumb: 'assets/images/gallery/img99.jpeg',
          alt: 'Suite Matrimonial - Baño con jacuzzi'
        },
        {
          src: 'assets/images/gallery/img100.jpeg',
          thumb: 'assets/images/gallery/img100.jpeg',
          alt: 'Suite Matrimonial - Terraza privada'
        }
      ]
    },
    {
      id: 4,
      title: 'Cocina comedor',
      category: 'kitchen',
      featured: true,
      images: [
        {
          src: 'assets/images/gallery/img4.jpeg',
          thumb: 'assets/images/gallery/img4.jpeg',
          alt: 'Fachada principal de día'
        },
        {
          src: 'assets/images/gallery/img78.jpeg',
          thumb: 'assets/images/gallery/img78.jpeg',
          alt: 'Fachada principal de noche'
        },
        {
          src: 'assets/images/gallery/img68.jpeg',
          thumb: 'assets/images/gallery/img68.jpeg',
          alt: 'Jardines y paisajismo'
        },
        {
          src: 'assets/images/gallery/img18.jpeg',
          thumb: 'assets/images/gallery/img18.jpeg',
          alt: 'Jardines y paisajismo'
        },
        {
          src: 'assets/images/gallery/img23.jpeg',
          thumb: 'assets/images/gallery/img23.jpeg',
          alt: 'Jardines y paisajismo'
        }
      ]
    },
    {
      id: 5,
      title: 'Jardines y Naturaleza',
      category: 'exterior',
      featured: false,
      images: [
        {
          src: 'assets/images/gallery/img49.jpeg',
          thumb: 'assets/images/gallery/img49.jpeg',
          alt: 'Jardines principales'
        },
        {
          src: 'assets/images/gallery/img48.jpeg',
          thumb: 'assets/images/gallery/img48.jpeg',
          alt: 'Senderos y caminos'
        },
        {
          src: 'assets/images/gallery/img25.jpeg',
          thumb: 'assets/images/gallery/img25.jpeg',
          alt: 'Senderos y caminos'
        },
        {
          src: 'assets/images/gallery/img24.jpeg',
          thumb: 'assets/images/gallery/img24.jpeg',
          alt: 'Senderos y caminos'
        },
        {
          src: 'assets/images/gallery/img27.jpeg',
          thumb: 'assets/images/gallery/img27.jpeg',
          alt: 'Senderos y caminos'
        }
      ]
    },
    {
      id: 6,
      title: 'Piscina y Área Acuática',
      category: 'pool',
      featured: true,
      images: [
        {
          src: 'assets/images/gallery/img74.jpeg',
          thumb: 'assets/images/gallery/img74.jpeg',
          alt: 'Piscina principal'
        },
        {
          src: 'assets/images/gallery/img73.jpeg',
          thumb: 'assets/images/gallery/img73.jpeg',
          alt: 'Área de relajación junto a la piscina'
        }
      ]
    },
    {
      id: 7,
      title: 'Baño Secundario(en suite)',
      category: 'bathroom',
      featured: false,
      images: [
        {
          src: 'assets/images/gallery/img94.jpeg',
          thumb: 'assets/images/gallery/img94.jpeg',
          alt: 'Baño Principal'
        },
        {
          src: 'assets/images/gallery/img95.jpeg',
          thumb: 'assets/images/gallery/img95.jpeg',
          alt: 'Baño Principal'
        },
        {
          src: 'assets/images/gallery/img96.jpeg',
          thumb: 'assets/images/gallery/img96.jpeg',
          alt: 'Baño Principal'
        },
        {
          src: 'assets/images/gallery/img97.jpeg',
          thumb: 'assets/images/gallery/img97.jpeg',
          alt: 'Baño Principal'
        },
      ]
    },
    {
      id: 8,
      title: 'Baño Principal',
      category: 'bathroom',
      featured: false,
      images: [
        {
          src: 'assets/images/gallery/img8.jpeg',
          thumb: 'assets/images/gallery/img8.jpeg',
          alt: 'Hamacas y sombrillas'
        },
        {
          src: 'assets/images/gallery/img9.jpeg',
          thumb: 'assets/images/gallery/img9.jpeg',
          alt: 'Hamacas y sombrillas'
        },
        {
          src: 'assets/images/gallery/img11.jpeg',
          thumb: 'assets/images/gallery/img11.jpeg',
          alt: 'Hamacas y sombrillas'
        },
        {
          src: 'assets/images/gallery/img16.jpeg',
          thumb: 'assets/images/gallery/img16.jpeg',
          alt: 'Hamacas y sombrillas'
        },
      ]
    },
    // {
    //   id: 8,
    //   title: 'Restaurante y Gastronomía',
    //   category: 'dining',
    //   featured: true,
    //   images: [
    //     {
    //       src: 'assets/images/gallery/restaurant-1.jpeg',
    //       thumb: 'assets/images/gallery/restaurant-1.jpeg',
    //       alt: 'Restaurante principal'
    //     },
    //     {
    //       src: 'assets/images/gallery/restaurant-2.jpeg',
    //       thumb: 'assets/images/gallery/restaurant-2.jpeg',
    //       alt: 'Terraza del restaurante'
    //     },
    //     {
    //       src: 'assets/images/gallery/restaurant-3.jpeg',
    //       thumb: 'assets/images/gallery/restaurant-3.jpeg',
    //       alt: 'Cocina y preparación'
    //     }
    //   ]
    // },
    // {
    //   id: 9,
    //   title: 'Desayuno y Buffet',
    //   category: 'dining',
    //   featured: false,
    //   images: [
    //     {
    //       src: 'assets/images/gallery/breakfast-1.jpeg',
    //       thumb: 'assets/images/gallery/breakfast-1.jpeg',
    //       alt: 'Buffet de desayuno'
    //     },
    //     {
    //       src: 'assets/images/gallery/breakfast-2.jpeg',
    //       thumb: 'assets/images/gallery/breakfast-2.jpeg',
    //       alt: 'Productos locales'
    //     }
    //   ]
    // },
    // {
    //   id: 10,
    //   title: 'Actividades y Aventura',
    //   category: 'activities',
    //   featured: false,
    //   images: [
    //     {
    //       src: 'assets/images/gallery/activities-1.jpeg',
    //       thumb: 'assets/images/gallery/activities-1.jpeg',
    //       alt: 'Senderismo y trekking'
    //     },
    //     {
    //       src: 'assets/images/gallery/activities-2.jpeg',
    //       thumb: 'assets/images/gallery/activities-2.jpeg',
    //       alt: 'Cabalgatas'
    //     },
    //     {
    //       src: 'assets/images/gallery/activities-3.jpeg',
    //       thumb: 'assets/images/gallery/activities-3.jpeg',
    //       alt: 'Avistamiento de aves'
    //     }
    //   ]
    // }
  ];
  
  // Variables para el control de la galería
  selectedCategory: string = 'all';
  filteredItems: GalleryItem[] = [...this.galleryItems];
  lightboxActive: boolean = false;
  currentItem: GalleryItem | null = null;
  currentImageIndex: number = 0;
  
  ngOnInit(): void {
    // Inicializar con todos los items
    this.filterItems('all');
  }
  
  ngOnDestroy(): void {
    // Limpiar eventos y restaurar scroll si es necesario
    if (this.lightboxActive) {
      document.body.style.overflow = '';
    }
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