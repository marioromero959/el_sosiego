import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  team = [
    {
      name: 'Carlos Rodríguez',
      position: 'Propietario & Director',
      bio: 'Con más de 20 años de experiencia en hostelería rural, Carlos es el alma de nuestra casa de campo.',
      photo: 'assets/images/team1.jpg'
    },
    {
      name: 'María López',
      position: 'Chef Principal',
      bio: 'Especialista en cocina tradicional con productos locales, María prepara deliciosos platos caseros diariamente.',
      photo: 'assets/images/team2.jpg'
    },
    {
      name: 'Javier Martínez',
      position: 'Responsable de Actividades',
      bio: 'Apasionado por la naturaleza, Javier organiza todas las actividades y excursiones de nuestra casa de campo.',
      photo: 'assets/images/team3.jpg'
    },
    {
      name: 'Laura Gómez',
      position: 'Encargada de Reservas',
      bio: 'Siempre con una sonrisa, Laura se encarga de coordinar las reservas y atender las necesidades de nuestros huéspedes.',
      photo: 'assets/images/team4.jpg'
    }
  ];

  timeline = [
    {
      year: 'ene-2024',
      title: 'Inicio del sueño',
      description: 'Compra de la finca original y comienzo de la renovación de la casa principal.',
      icon: 'fa-house'
    },
    {
      year: 'ago-2024',
      title: 'Apertura oficial',
      description: 'Inauguración oficial del Sosiego con las 4 habitaciones.',
      icon: 'fa-door-open'
    },
    {
      year: 'ene-2025',
      title: 'Modernizacion',
      description: 'Decidimos actualizar el internet a un servicio satelital utilizando starlink.',
      icon: 'fa-wifi'
    },
    // {
    //   year: '2015',
    //   title: 'Renovación de instalaciones',
    //   description: 'Mejora de todas las habitaciones y creación del restaurante con terraza panorámica.',
    //   icon: 'fa-utensils'
    // },
    {
      year: 'feb-2025',
      title: 'Área de Piscina',
      description: 'Recibimos el verano 2025 con la piscina para disfrutar del calor.',
      icon: 'fa-water-ladder'
    },
    {
      year: 'jun-2025',
      title: 'Casamiento',
      description: 'Festejamos nuestro primer evento. El casamiento de Joaquin y Delfi!',
      icon: 'fa-heart'
    }
  ];
}