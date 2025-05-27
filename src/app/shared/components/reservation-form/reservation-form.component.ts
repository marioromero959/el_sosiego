import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { DateAvailability, CalendarMonth } from '../../../core/models/reservation.model';
import { format, addDays, addMonths, startOfMonth, isSameDay, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  @Input() simplified: boolean = false;
  
  reservationForm!: FormGroup;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  
  // Variables para el calendario
  currentMonth: CalendarMonth | null = null;
  selectedCheckIn: Date | null = null;
  selectedCheckOut: Date | null = null;
  currentDate: Date = new Date();
  showCalendar: boolean = false;
  calendarLoading: boolean = false;
  
  // Variables para mostrar disponibilidad
  availabilityResult: {available: boolean, totalPrice: number} | null = null;
  showBookingForm: boolean = false;
  
  // Precio por noche
  pricePerNight: number = 0;
  
  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.pricePerNight = this.reservationService.getPricePerNight();
    if (!this.simplified) {
      this.loadCurrentMonth();
    }
  }

  initForm(): void {
    this.reservationForm = this.fb.group({
      guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]]
    });
    
    // Solo añadir campos adicionales si no es simplificado
    if (!this.simplified) {
      this.reservationForm.addControl('name', this.fb.control('', [Validators.required, Validators.minLength(3)]));
      this.reservationForm.addControl('email', this.fb.control('', [Validators.required, Validators.email]));
      this.reservationForm.addControl('phone', this.fb.control('', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{9,15}$/)]));
      this.reservationForm.addControl('specialRequests', this.fb.control(''));
    }
  }

  // Cargar disponibilidad del mes actual
  loadCurrentMonth(): void {
    this.calendarLoading = true;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;
    
    this.reservationService.getMonthAvailability(year, month)
      .subscribe({
        next: (monthData) => {
          this.currentMonth = monthData;
          this.calendarLoading = false;
        },
        error: (error) => {
          console.error('Error loading month availability:', error);
          this.calendarLoading = false;
        }
      });
  }

  // Navegar a mes anterior/siguiente
  navigateMonth(direction: number): void {
    this.currentDate = addMonths(this.currentDate, direction);
    this.loadCurrentMonth();
  }

  // Seleccionar fecha en el calendario
  selectDate(dateAvailability: DateAvailability): void {
    if (!dateAvailability.available) {
      return;
    }

    const selectedDate = dateAvailability.date;

    if (!this.selectedCheckIn || (this.selectedCheckIn && this.selectedCheckOut)) {
      // Primera selección o reiniciar selección
      this.selectedCheckIn = selectedDate;
      this.selectedCheckOut = null;
      this.availabilityResult = null;
    } else if (this.selectedCheckIn && !this.selectedCheckOut) {
      // Segunda selección
      if (isBefore(selectedDate, this.selectedCheckIn)) {
        // Si la segunda fecha es anterior, intercambiar
        this.selectedCheckOut = this.selectedCheckIn;
        this.selectedCheckIn = selectedDate;
      } else {
        this.selectedCheckOut = selectedDate;
      }
      
      // Calcular precio inmediatamente sin verificar disponibilidad del rango
      this.calculateTotalPrice();
    }
  }

  // Calcular precio total
  private calculateTotalPrice(): void {
    if (this.selectedCheckIn && this.selectedCheckOut) {
      const nights = this.calculateNights();
      const totalPrice = nights * this.pricePerNight;
      
      this.availabilityResult = {
        available: true,
        totalPrice: totalPrice
      };
    }
  }

  // Proceder al siguiente paso (formulario de datos)
  proceedToBooking(): void {
    if (!this.selectedCheckIn || !this.selectedCheckOut) {
      return;
    }
    
    // Verificar disponibilidad final antes de proceder
    this.isLoading = true;
    this.reservationService.checkDateRangeAvailability(
      this.selectedCheckIn, 
      this.selectedCheckOut, 
      this.reservationForm.value.guests
    ).subscribe({
      next: (result) => {
        console.log(result);
        
        this.availabilityResult = result;
        this.isLoading = false;
        
        if (result.available) {
          this.showBookingForm = true;
        } else {
          // Mostrar mensaje de error
          alert('Lo sentimos, las fechas seleccionadas ya no están disponibles. Por favor, elige otras fechas.');
          this.resetDateSelection();
        }
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        this.isLoading = false;
        alert('Error al verificar disponibilidad. Por favor, intenta de nuevo.');
      }
    });
  }

  // Métodos auxiliares para el calendario
  getDaysInMonth(): DateAvailability[] {
    if (!this.currentMonth) return [];
    return this.currentMonth.days;
  }

  getMonthName(): string {
    return format(this.currentDate, 'MMMM yyyy', { locale: es });
  }

  isDateSelected(date: Date): boolean {
    if (!this.selectedCheckIn) return false;
    
    if (this.selectedCheckOut) {
      return (isSameDay(date, this.selectedCheckIn) || 
              isSameDay(date, this.selectedCheckOut) ||
              (isAfter(date, this.selectedCheckIn) && isBefore(date, this.selectedCheckOut)));
    }
    
    return isSameDay(date, this.selectedCheckIn);
  }

  isDateInRange(date: Date): boolean {
    if (!this.selectedCheckIn || !this.selectedCheckOut) return false;
    return isAfter(date, this.selectedCheckIn) && isBefore(date, this.selectedCheckOut);
  }

  // Calcular noches
  calculateNights(): number {
    if (!this.selectedCheckIn || !this.selectedCheckOut) return 0;
    const diffTime = Math.abs(this.selectedCheckOut.getTime() - this.selectedCheckIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Formatear fecha
  formatDate(date: Date): string {
    return format(date, 'eeee, d MMMM yyyy', { locale: es });
  }

  // Verificar si se pueden seleccionar fechas
  canProceedToBooking(): boolean {
    return !!(this.selectedCheckIn && this.selectedCheckOut && this.availabilityResult?.available);
  }

  // Enviar reserva
  submitReservation(): void {
    if (this.reservationForm.invalid || !this.selectedCheckIn || !this.selectedCheckOut) {
      this.markFormGroupTouched(this.reservationForm);
      return;
    }
    
    this.isLoading = true;
    
    const reservationData = {
      ...this.reservationForm.value,
      checkIn: this.selectedCheckIn,
      checkOut: this.selectedCheckOut,
      totalPrice: this.availabilityResult?.totalPrice || 0
    };
    
    this.reservationService.createReservation(reservationData)
      .subscribe({
        next: (result) => {
          this.isLoading = false;
          this.isSubmitted = true;
          console.log('Reservation created', result);
        },
        error: (error) => {
          console.error('Error creating reservation', error);
          this.isLoading = false;
        }
      });
  }

  // Reiniciar formulario
  resetForm(): void {
    this.isSubmitted = false;
    this.showBookingForm = false;
    this.selectedCheckIn = null;
    this.selectedCheckOut = null;
    this.availabilityResult = null;
    this.initForm();
  }

  // Reiniciar selección de fechas
  resetDateSelection(): void {
    this.selectedCheckIn = null;
    this.selectedCheckOut = null;
    this.availabilityResult = null;
    this.showBookingForm = false;
  }

  // Método auxiliar para marcar campos como tocados
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }

  // Getter para controles del formulario
  get fc() {
    return this.reservationForm.controls;
  }

  // Para el formulario simplificado
  searchAvailability(): void {
    if (this.simplified) {
      this.router.navigate(['/reservar'], { 
        queryParams: { 
          guests: this.reservationForm.value.guests
        } 
      });
    }
  }
}