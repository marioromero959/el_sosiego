import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { Room } from '../../../core/models/reservation.model';
// Corregir los imports de date-fns
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, JsonPipe],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  @Input() simplified: boolean = false;
  
  reservationForm!: FormGroup;
  availableRooms: Room[] = [];
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  
  // Fechas mínimas para check-in y check-out
  minCheckInDate: string = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  minCheckOutDate: string = format(addDays(new Date(), 2), 'yyyy-MM-dd');
  
  // Variables para mostrar resultados
  showResults: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.reservationForm = this.fb.group({
      checkIn: [format(addDays(new Date(), 1), 'yyyy-MM-dd'), Validators.required],
      checkOut: [format(addDays(new Date(), 3), 'yyyy-MM-dd'), Validators.required],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
      roomType: [this.simplified ? null : '']
    });
    
    // Si no es el formulario simplificado, añadimos validadores adicionales
    if (!this.simplified) {
      this.reservationForm.addControl('name', this.fb.control('', [Validators.required, Validators.minLength(3)]));
      this.reservationForm.addControl('email', this.fb.control('', [Validators.required, Validators.email]));
      this.reservationForm.addControl('phone', this.fb.control('', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{9,15}$/)]));
      this.reservationForm.addControl('specialRequests', this.fb.control(''));
    }
    
    // Actualizamos la fecha mínima de checkout al cambiar checkin
    this.reservationForm.get('checkIn')?.valueChanges.subscribe(val => {
      if (val) {
        const checkInDate = new Date(val);
        const nextDay = addDays(checkInDate, 1);
        this.minCheckOutDate = format(nextDay, 'yyyy-MM-dd');
        
        // Si la fecha de salida es menor que la nueva fecha mínima, actualizamos
        const currentCheckOut = this.reservationForm.get('checkOut')?.value;
        if (currentCheckOut && new Date(currentCheckOut) <= checkInDate) {
          this.reservationForm.get('checkOut')?.setValue(format(nextDay, 'yyyy-MM-dd'));
        }
      }
    });
  }

  // Método para buscar disponibilidad
  searchAvailability() {
    if (this.simplified && this.reservationForm.invalid) {
      this.markFormGroupTouched(this.reservationForm);
      return;
    }
    
    this.isLoading = true;
    
    const checkIn = new Date(this.reservationForm.value.checkIn);
    const checkOut = new Date(this.reservationForm.value.checkOut);
    const guests = this.reservationForm.value.guests;
    
    this.reservationService.checkAvailability(checkIn, checkOut, guests)
      .subscribe({
        next: (rooms) => {
          this.availableRooms = rooms;
          this.showResults = true;
          this.isLoading = false;
          
          // Si estamos en el formulario simplificado, redirigimos a la página de reserva
          if (this.simplified) {
            this.router.navigate(['/reservar'], { 
              queryParams: { 
                checkIn: format(checkIn, 'yyyy-MM-dd'),
                checkOut: format(checkOut, 'yyyy-MM-dd'),
                guests: guests
              } 
            });
          }
        },
        error: (error) => {
          console.error('Error checking availability', error);
          this.isLoading = false;
        }
      });
  }
  
  // Método para enviar la reserva
  submitReservation() {
    if (this.reservationForm.invalid) {
      this.markFormGroupTouched(this.reservationForm);
      return;
    }
    
    this.isLoading = true;
    
    const reservationData = {
      ...this.reservationForm.value,
      checkIn: new Date(this.reservationForm.value.checkIn),
      checkOut: new Date(this.reservationForm.value.checkOut)
    };
    
    this.reservationService.createReservation(reservationData)
      .subscribe({
        next: (result) => {
          this.isLoading = false;
          this.isSubmitted = true;
          
          // Redirigir a confirmación o mostrar mensaje
          console.log('Reservation created', result);
        },
        error: (error) => {
          console.error('Error creating reservation', error);
          this.isLoading = false;
        }
      });
  }
  
  // Método auxiliar para marcar todos los campos como tocados
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }
  
  // Getter para fácil acceso a los controles del formulario
  get fc() {
    return this.reservationForm.controls;
  }
  
  // Métodos para calcular precios, fechas, etc.
  calculateNights(): number {
    if (!this.reservationForm.value.checkIn || !this.reservationForm.value.checkOut) return 0;
    
    const checkIn = new Date(this.reservationForm.value.checkIn);
    const checkOut = new Date(this.reservationForm.value.checkOut);
    
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  calculateTotalPrice(room: Room): number {
    return this.calculateNights() * room.pricePerNight;
  }
  
  formatDate(date: string): string {
    // Corregir la forma de usar locale
    return format(new Date(date), 'eeee, d MMMM yyyy', { locale: es });
  }
  
  // Método para seleccionar una habitación
  selectRoom(room: Room) {
    this.reservationForm.patchValue({
      roomType: room.type
    });
  }
  
  // Método para volver al formulario
  backToForm() {
    this.showResults = false;
  }
  
  // Método para reiniciar después de enviar
  resetForm() {
    this.isSubmitted = false;
    this.showResults = false;
    this.initForm();
  }

  getSelectedRoomPrice(): number {
  const room = this.availableRooms.find(r => r.type === this.reservationForm.value.roomType);
  if (room) {
    return this.calculateTotalPrice(room);
  }
  return 0;
}

getSelectedRoomName(): string {
  const room = this.availableRooms.find(r => r.type === this.reservationForm.value.roomType);
  return room ? room.name : 'No seleccionada';
}

}