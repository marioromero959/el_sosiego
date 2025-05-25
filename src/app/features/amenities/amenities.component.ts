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
      title: 'Cocina comedor con barra',
      description: 'Nuestra amplia cocina con barra incluida ofrece todos los utensilios necesarios para preparar cualquier comida en casa.',
      features: [
        'Heladera',
        'Cocina a gas con horno',
        'Horno electrico',
        'Juego completo de valijja',
        'Barra para desayunar',
        'Pava electrica'
      ],
      image: 'assets/images/gallery/img18.jpeg'
    },
    {
      id: 'pool',
      title: 'Piscina y Zonas de Relax',
      description: 'Disfruta de nuestra piscina exterior. La zona de piscina está equipada con sombrillas y todo lo necesario para disfrutar de un día de relax al sol.',
      features: [
        'Piscina exterior (abierta de diciemre a abril)',
        'Sombrillas',
        'Toallas de piscina disponibles',
        'Zona de descanso bajo techo',
        'Barra de seguridad para los  niños'
      ],
      image: 'assets/images/gallery/img73.jpeg'
    },
    {
      id: 'wellness',
      title: 'Área de Descanso',
      description: 'Nuestro espacio dedicado al bienestar te ofrece un remanso de paz para equilibrar cuerpo y mente. Después de un día de actividades, no hay nada mejor que relajarse.',
      features: [
        'Servcio de TV con plataformas de streaming',
        'Chimenea',
        'Sofa',
        'Espacio de juego para los mas pequeños'
      ],
      image: 'assets/images/gallery/img5.jpeg'
    },
    {
      id: 'living',
      title: 'Comedor',
      description: 'En nuestra casa de campo ofrecemos una mesa comedor moderna para compartir en familia almuerzos, meriendas, cenas.',
      features: [
        'Mesa ovalada con diseño moderno',
        'Juego de 4 sillas',
        'Manteles e individuales'
      ],
      image: 'assets/images/gallery/img80.jpeg'
    },
    {
      id: 'garden',
      title: 'Jardín',
      description: 'Sin duda nuestro jarin es una de las joyas de la casa. Es un espacio de relajacion, juego y cualquier actividad que se quiera hacer al aire lbre.',
      features: [
        'Espacio verde tanquilo para disfrutar de un mate en invierno o tomar sol en verano',
        'Servicio de jardineria cada 7 dias'
      ],
      image: 'assets/images/gallery/img82.jpeg'
    },
    {
      id: 'lounge',
      title: 'Comedor Secundario',
      description: 'Ofretemos dos espacios de comedor, cerca de la cocina para disfrutar de todo "recien salido del horno".',
      features: [
        'Comedor rustico',
        'Juego de 4 sillas de madera',
        'Ventilador de techo',
        'Manteles e individuales'
      ],
      image: 'assets/images/gallery/img78.jpeg'
    },
        {
      id: 'principal_bathroom',
      title: 'Baño Principal',
      description: 'Baño principal con antebaño y ducha".',
      features: [
        'Antebaño',
        'Botiquin de emergencia',
        'Bidet',
        'Ducha con agua F/C'
      ],
      image: 'assets/images/gallery/img94.jpeg'
    },
        {
      id: 'secondary_bathroom',
      title: 'Baño Secundario en Suite Matrimonial',
      description: 'Este baño privado se encuentra en la suite matrimonial".',
      features: [
        'Antebaño',
        'Botiquin de emergencia',
        'Bidet',
        'Ducha con agua F/C'
      ],
      image: 'assets/images/gallery/img97.jpeg'
    }
  ];
  
  additionalServices = [
    {
      icon: 'fas fa-car',
      title: 'Cuidado de Vehículos',
      description: 'Persona encargada de custodiar todos tus vehiculos dentro de la propiedad.',
      price: 'Desde 2.000$/día'
    },
    {
      icon: 'fas fa-utensils',
      title: 'Desayuno incluido',
      description: 'Con la reserva de 5 o más dias en el Sosiego te ofrecemos un desayuno casero con productos locales.',
      price: 'En promoción'
    },
    {
      icon: 'fas fa-glass-cheers',
      title: 'Celebraciones Especiales',
      description: 'Organizamos eventos como cumpleaños, casamientos o pequeñas reuniones familiares.',
      price: 'Consultar precios'
    },
    {
      icon: 'fas fa-spa',
      title: 'Servicio de Masajes',
      description: 'Personal cualificado para realizar una sesion de masajes para descontracturar y aliviar los musculos.',
      price: '15.000$/persona'
    },
    {
      icon: 'fas fa-shuttle-van',
      title: 'Traslados',
      description: 'Servicio de recogida y traslado a estaciones de tren o aeropuertos cercanos.',
      price: 'Desde 20.000$€'
    },
    {
      icon: 'fas fa-shopping-basket',
      title: 'Productos Locales',
      description: 'Selección de productos artesanales y gourmet de la región para llevar.',
      price: 'Varios precios'
    }
  ];
}