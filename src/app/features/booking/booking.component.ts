import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationFormComponent } from '../../shared/components/reservation-form/reservation-form.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReservationFormComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {
  // Las funcionalidades principales están en el componente ReservationFormComponent
}