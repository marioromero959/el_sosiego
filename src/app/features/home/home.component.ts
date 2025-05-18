import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationFormComponent } from '../../shared/components/reservation-form/reservation-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReservationFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  amenities = [
    {
      icon: 'wifi.svg',
      title: 'Wi-Fi Gratis',
      description: 'Conexión rápida y estable en toda la propiedad.'
    },
    {
      icon: 'pool.svg',
      title: 'Piscina',
      description: 'Disfruta de nuestra piscina con vistas espectaculares.'
    },
    {
      icon: 'breakfast.svg',
      title: 'Desayuno',
      description: 'Desayuno completo con productos locales y caseros.'
    },
    {
      icon: 'parking.svg',
      title: 'Estacionamiento',
      description: 'Amplio estacionamiento gratuito para todos los huéspedes.'
    }
  ];

  testimonials = [
    {
      name: 'Elena García',
      photo: 'assets/images/testimonial1.jpg',
      text: 'Nuestra estancia fue maravillosa. Las instalaciones están impecables y el entorno natural es increíble. Volveremos seguro.',
      rating: 5
    },
    {
      name: 'Miguel Rodríguez',
      photo: 'assets/images/testimonial2.jpg',
      text: 'Un lugar perfecto para desconectar. Habitaciones cómodas, personal atento y la comida deliciosa. Lo recomendaré a todos mis amigos.',
      rating: 5
    },
    {
      name: 'Laura Martínez',
      photo: 'assets/images/testimonial3.jpg',
      text: 'Hemos pasado un fin de semana fantástico, el lugar es precioso y tranquilo. Ideal para escapar del estrés de la ciudad.',
      rating: 4
    }
  ];
}