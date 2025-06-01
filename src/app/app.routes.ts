import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Casa de Campo - Inicio'
  },
  { 
    path: 'sobre-nosotros', 
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'Casa de Campo - Sobre Nosotros'
  },
  { 
    path: 'alojamientos', 
    loadComponent: () => import('./features/accommodations/accommodations.component').then(m => m.AccommodationsComponent),
    title: 'Casa de Campo - Alojamientos'
  },
  { 
    path: 'servicios', 
    loadComponent: () => import('./features/amenities/amenities.component').then(m => m.AmenitiesComponent),
    title: 'Casa de Campo - Servicios'
  },
  { 
    path: 'galeria', 
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Casa de Campo - Galería'
  },
  { 
    path: 'contacto', 
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Casa de Campo - Contacto'
  },
  { 
    path: 'reservar', 
    loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent),
    title: 'Casa de Campo - Reservar'
  },
  { 
    path: 'mi-reserva', 
    loadComponent: () => import('./features/reservation-lookup/reservation-lookup').then(m => m.ReservationLookupComponent),
    title: 'Casa de Campo - Mi Reserva'
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];