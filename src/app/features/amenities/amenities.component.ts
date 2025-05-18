import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-amenities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './amenities.component.html',
  styleUrl: './amenities.component.scss'
})
export class AmenitiesComponent {
  facilities = [
    {
      id: 'dining',
      title: 'Restaurante y Bar',
      description: 'Nuestro restaurante ofrece una experiencia gastronómica única con productos locales y de temporada. El menú cambia regularmente para aprovechar los ingredientes más frescos, muchos de ellos procedentes de nuestra propia huerta ecológica.',
      features: [
        'Desayuno buffet de 8:00 a 10:30',
        'Almuerzo de 13:30 a 16:00',
        'Cena de 20:00 a 22:30',
        'Menú degustación con maridaje de vinos locales',
        'Opciones vegetarianas, veganas y para alergias alimentarias',
        'Bar con terraza panorámica abierto de 12:00 a 24:00'
      ],
      image: 'assets/images/facility-restaurant.jpg'
    },
    {
      id: 'pool',
      title: 'Piscina y Zonas de Relax',
      description: 'Disfruta de nuestra piscina exterior con vistas panorámicas al valle. La zona de piscina está equipada con tumbonas, sombrillas y servicio de bar, todo lo necesario para disfrutar de un día de relax al sol.',
      features: [
        'Piscina exterior (abierta de mayo a septiembre)',
        'Tumbonas y sombrillas gratuitas',
        'Toallas de piscina disponibles',
        'Zona de hamacas bajo los árboles',
        'Jardines para pasear y relajarse',
        'Servicio de bebidas y snacks'
      ],
      image: 'assets/images/facility-pool.jpg'
    },
    {
      id: 'wellness',
      title: 'Área de Bienestar',
      description: 'Nuestro espacio dedicado al bienestar te ofrece un remanso de paz para equilibrar cuerpo y mente. Después de un día de actividades, no hay nada mejor que relajarse con un buen masaje o en nuestro jacuzzi.',
      features: [
        'Sala de masajes con terapeutas profesionales',
        'Tratamientos corporales y faciales con productos naturales',
        'Jacuzzi exterior con vistas panorámicas',
        'Sauna finlandesa',
        'Sesiones de yoga en el jardín (temporada de verano)',
        'Servicio de infusiones y aguas aromatizadas'
      ],
      image: 'assets/images/facility-wellness.jpg'
    },
    {
      id: 'activities',
      title: 'Actividades y Excursiones',
      description: 'En nuestra casa de campo ofrecemos una amplia variedad de actividades para que puedas disfrutar de la naturaleza y la cultura local. Ya sea que busques aventura o cultura, tenemos opciones para todos los gustos.',
      features: [
        'Rutas de senderismo guiadas por el entorno natural',
        'Paseos a caballo para todos los niveles',
        'Alquiler de bicicletas de montaña',
        'Talleres de cocina tradicional',
        'Visitas a productores locales (bodegas, queserías)',
        'Actividades especiales para niños en temporada alta'
      ],
      image: 'assets/images/facility-activities.jpg'
    },
    {
      id: 'garden',
      title: 'Huerto y Jardines',
      description: 'Nuestro huerto ecológico es una de las joyas de la casa. Cultivamos una gran variedad de verduras, frutas y hierbas aromáticas que se utilizan en la cocina del restaurante. Te invitamos a visitarlo y conocer nuestro compromiso con la sostenibilidad.',
      features: [
        'Huerto ecológico con visitas guiadas',
        'Jardines temáticos con plantas autóctonas',
        'Espacio para picnics',
        'Zona de juegos infantiles al aire libre',
        'Mirador con vistas panorámicas',
        'Pequeño estanque con peces'
      ],
      image: 'assets/images/facility-garden.jpg'
    },
    {
      id: 'lounge',
      title: 'Salones Comunes',
      description: 'Nuestros salones comunes son espacios acogedores donde podrás relajarte, leer, jugar o simplemente disfrutar de una buena conversación junto a la chimenea o en nuestra biblioteca.',
      features: [
        'Salón con chimenea y vistas al jardín',
        'Biblioteca con selección de libros y juegos de mesa',
        'Sala de TV con plataformas de streaming',
        'Conexión Wi-Fi gratuita en todas las áreas',
        'Espacio de coworking para necesidades laborales',
        'Rincón del café disponible 24 horas'
      ],
      image: 'assets/images/facility-lounge.jpg'
    }
  ];
  
  additionalServices = [
    {
      icon: 'fas fa-car',
      title: 'Alquiler de Vehículos',
      description: 'Servicio de alquiler de coches para explorar la zona a tu ritmo.',
      price: 'Desde 50€/día'
    },
    {
      icon: 'fas fa-utensils',
      title: 'Cesta de Picnic',
      description: 'Prepararemos una deliciosa cesta con productos locales para tus excursiones.',
      price: '25€ por persona'
    },
    {
      icon: 'fas fa-glass-cheers',
      title: 'Celebraciones Especiales',
      description: 'Organizamos eventos como cumpleaños, aniversarios o pequeñas reuniones familiares.',
      price: 'Consultar precios'
    },
    {
      icon: 'fas fa-baby',
      title: 'Servicio de Niñera',
      description: 'Personal cualificado para cuidar de los más pequeños mientras disfrutas de tu tiempo.',
      price: '15€/hora'
    },
    {
      icon: 'fas fa-shuttle-van',
      title: 'Traslados',
      description: 'Servicio de recogida y traslado a estaciones de tren o aeropuertos cercanos.',
      price: 'Desde 30€'
    },
    {
      icon: 'fas fa-shopping-basket',
      title: 'Productos Locales',
      description: 'Selección de productos artesanales y gourmet de la región para llevar.',
      price: 'Varios precios'
    }
  ];
}