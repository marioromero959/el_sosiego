import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { DateAvailability, CalendarMonth } from '../../../core/models/reservation.model';
import { AlertModalComponent, AlertModalData } from '../alert-modal/alert-modal.component';
import { format, addDays, addMonths, startOfMonth, endOfMonth, isSameDay, isBefore, isAfter, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, AlertModalComponent],
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
  
  // Variables para el modal de alerta
  showAlertModal: boolean = false;
  alertModalData: AlertModalData = {
    title: '',
    message: '',
    type: 'info'
  };
  
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
          
          // Solo recalcular precio si ambas fechas están seleccionadas y al menos una está en el mes actual
          if (this.selectedCheckIn && this.selectedCheckOut) {
            const checkInInMonth = this.isDateInCurrentMonth(this.selectedCheckIn);
            const checkOutInMonth = this.isDateInCurrentMonth(this.selectedCheckOut);
            
            if (checkInInMonth || checkOutInMonth) {
              // Solo recalcular precio, no verificar disponibilidad automáticamente
              this.calculateTotalPrice();
            }
          }
        },
        error: (error) => {
          console.error('Error loading month availability:', error);
          this.calendarLoading = false;
          this.showAlert({
            title: 'Error de Carga',
            message: 'No pudimos cargar la disponibilidad del calendario. Por favor, intenta recargar la página.',
            type: 'error'
          });
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
      this.showAlert({
        title: 'Fecha No Disponible',
        message: 'Esta fecha no está disponible para reservas. Por favor, selecciona otra fecha.',
        type: 'warning'
      });
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
      } else if (isSameDay(selectedDate, this.selectedCheckIn)) {
        // Si selecciona la misma fecha, mostrar alerta
        this.showAlert({
          title: 'Selección Inválida',
          message: 'La fecha de salida debe ser diferente a la fecha de llegada. Por favor, selecciona una fecha posterior.',
          type: 'warning'
        });
        return;
      } else {
        this.selectedCheckOut = selectedDate;
      }
      
      // Solo verificar rango si ambas fechas están en el mes actual visible
      const checkInInMonth = this.isDateInCurrentMonth(this.selectedCheckIn);
      const checkOutInMonth = this.isDateInCurrentMonth(this.selectedCheckOut);
      
      if (checkInInMonth && checkOutInMonth) {
        // Ambas fechas están en el mes actual, verificar rango completo
        this.checkSelectedRangeAvailability();
      } else {
        // Las fechas están en diferentes meses, solo calcular precio
        this.calculateTotalPrice();
      }
    }
  }

  // Verificar disponibilidad del rango seleccionado
  private checkSelectedRangeAvailability(): void {
    if (!this.selectedCheckIn || !this.selectedCheckOut || !this.currentMonth) {
      return;
    }

    // Verificar que las fechas seleccionadas estén en el mes actual visible
    const checkInInCurrentMonth = this.isDateInCurrentMonth(this.selectedCheckIn);
    const checkOutInCurrentMonth = this.isDateInCurrentMonth(this.selectedCheckOut);
    
    // Solo verificar si al menos una fecha está en el mes actual
    if (!checkInInCurrentMonth && !checkOutInCurrentMonth) {
      return;
    }

    // Verificar que todas las fechas en el rango estén disponibles
    const startDate = new Date(this.selectedCheckIn);
    const endDate = new Date(this.selectedCheckOut);
    
    let currentDate = new Date(startDate);
    let allAvailable = true;
    
    while (currentDate < endDate) {
      const dayAvailability = this.currentMonth.days.find(day => 
        isSameDay(day.date, currentDate)
      );
      
      if (!dayAvailability || !dayAvailability.available) {
        allAvailable = false;
        break;
      }
      
      currentDate = addDays(currentDate, 1);
    }

    if (!allAvailable) {
      this.showAlert({
        title: 'Rango No Disponible',
        message: 'Algunas fechas en el rango seleccionado no están disponibles. Por favor, selecciona otro período.',
        type: 'warning'
      });
      this.resetDateSelection();
      return;
    }

    // Si todo está disponible, calcular precio
    this.calculateTotalPrice();
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
          this.showAlert({
            title: 'Fechas No Disponibles',
            message: 'Lo sentimos, las fechas seleccionadas ya no están disponibles o no hay suficiente capacidad para el número de huéspedes. Por favor, elige otras fechas o reduce el número de huéspedes.',
            type: 'error',
            confirmText: 'Seleccionar otras fechas'
          });
          this.resetDateSelection();
        }
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        this.isLoading = false;
        this.showAlert({
          title: 'Error de Verificación',
          message: 'Ocurrió un error al verificar la disponibilidad. Por favor, intenta de nuevo.',
          type: 'error',
          confirmText: 'Reintentar'
        });
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

  // Calcular noches correctamente
  calculateNights(): number {
    if (!this.selectedCheckIn || !this.selectedCheckOut) return 0;
    return differenceInDays(this.selectedCheckOut, this.selectedCheckIn);
  }

  // Formatear fecha
  formatDate(date: Date): string {
    return format(date, 'eeee, d MMMM yyyy', { locale: es });
  }

  // Verificar si se pueden seleccionar fechas
  canProceedToBooking(): boolean {
    return !!(this.selectedCheckIn && this.selectedCheckOut && this.availabilityResult?.available);
  }

  // Verificar si una fecha está en el mes actual visible
  private isDateInCurrentMonth(date: Date): boolean {
    const currentMonthStart = startOfMonth(this.currentDate);
    const currentMonthEnd = endOfMonth(this.currentDate);
    return date >= currentMonthStart && date <= currentMonthEnd;
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
          this.showAlert({
            title: 'Error en la Reserva',
            message: 'No pudimos procesar tu reserva. Por favor, intenta de nuevo o contacta nuestro soporte.',
            type: 'error',
            confirmText: 'Reintentar'
          });
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

  // Métodos para el modal de alerta
  private showAlert(data: Partial<AlertModalData>): void {
    this.alertModalData = {
      title: data.title || '',
      message: data.message || '',
      type: data.type || 'info',
      confirmText: data.confirmText || 'Entendido',
      cancelText: data.cancelText,
      showCancel: data.showCancel || false
    };
    this.showAlertModal = true;
  }

  onAlertConfirmed(): void {
    this.showAlertModal = false;
  }

  onAlertCancelled(): void {
    this.showAlertModal = false;
  }

  onAlertClosed(): void {
    this.showAlertModal = false;
  }
}