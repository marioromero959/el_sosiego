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
      year: '1998',
      title: 'Inicio del sueño',
      description: 'Compra de la finca original y comienzo de la renovación de la casa principal.',
      icon: 'fa-house'
    },
    {
      year: '2003',
      title: 'Apertura oficial',
      description: 'Inauguración oficial de la Casa de Campo con las primeras 5 habitaciones.',
      icon: 'fa-door-open'
    },
    {
      year: '2010',
      title: 'Primera expansión',
      description: 'Ampliación con 5 habitaciones más y construcción de la piscina exterior.',
      icon: 'fa-water'
    },
    {
      year: '2015',
      title: 'Renovación de instalaciones',
      description: 'Mejora de todas las habitaciones y creación del restaurante con terraza panorámica.',
      icon: 'fa-utensils'
    },
    {
      year: '2021',
      title: 'Área de actividades',
      description: 'Creación de nuevas áreas de recreo y espacios para actividades al aire libre.',
      icon: 'fa-person-hiking'
    },
    {
      year: '2024',
      title: 'Sostenibilidad',
      description: 'Implementación de medidas de sostenibilidad y energías renovables en toda la propiedad.',
      icon: 'fa-leaf'
    }
  ];
}