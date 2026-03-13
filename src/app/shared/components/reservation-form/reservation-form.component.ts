import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReservationService, CreateReservationResponse, CreateReservationData } from '../../../core/services/reservation.service';
import { DateAvailability, CalendarMonth } from '../../../core/models/reservation.model';
import { AlertModalComponent, AlertModalData } from '../alert-modal/alert-modal.component';
import { format, addDays, addMonths, startOfMonth, endOfMonth, isSameDay, isBefore, isAfter, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { PaymentService } from '../../../core/services/payment.service';
import { CurrencyService, PriceInfo } from '../../../core/services/currency.service';

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
  
  // Resultado de la reserva creada
  createdReservation: CreateReservationResponse | null = null;
  
  // Precio por noche
  pricePerNight: number = 0;
  
  // ✅ NUEVO: Variables para conversión de moneda
  priceInfo: PriceInfo | null = null;
  exchangeRate: number = 0;
  
  // Variables para el modal de alerta
  showAlertModal: boolean = false;
  alertModalData: AlertModalData = {
    title: '',
    message: '',
    type: 'info'
  };

  // ✅ NUEVO: Variables para Checkout Pro
  isProcessingCheckout: boolean = false;
  checkoutError: string | null = null;
  checkoutSuccess: boolean = false;
  checkoutResult: any = null;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private paymentService: PaymentService,
    private currencyService: CurrencyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.pricePerNight = this.reservationService.getPricePerNight();
    
    // ✅ NUEVO: Obtener tasa de cambio
    this.currencyService.getExchangeRate().subscribe(rate => {
      this.exchangeRate = rate.ars;
      console.log('💱 Tasa de cambio cargada:', this.exchangeRate);
    });
    
    if (!this.simplified) {
      this.loadCurrentMonth();
    }
    
    // ✅ NUEVO: Manejar retorno desde Checkout Pro
    this.handleCheckoutReturn();
  }

  initForm(): void {
    this.reservationForm = this.fb.group({
      guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]]
    });
    
    // Solo añadir campos adicionales si no es simplificado
    if (!this.simplified) {
      this.reservationForm.addControl('name', this.fb.control('', [Validators.required, Validators.minLength(3)]));
      this.reservationForm.addControl('email', this.fb.control('', [Validators.required, Validators.email]));
      this.reservationForm.addControl('phone', this.fb.control('', [Validators.required, Validators.pattern(/^(\+?57)?[0-9\s-]{10,15}$/)]));
      this.reservationForm.addControl('specialRequests', this.fb.control(''));
      this.reservationForm.addControl('termsCheck', this.fb.control(false ,[Validators.requiredTrue]));
    }
  }

  // ✅ NUEVO: Manejar retorno desde Checkout Pro
  private handleCheckoutReturn(): void {
    const returnData = this.paymentService.handleReturnFromCheckout();
    
    if (returnData) {
      console.log('🔄 Handling return from Checkout Pro:', returnData);
      
      // Verificar el estado del pago
      if (returnData.preferenceId) {
        this.verifyPaymentResult(returnData.preferenceId);
      }
      
      // Limpiar parámetros de URL
      this.paymentService.cleanUrlParams();
    }
  }

  // ✅ NUEVO: Verificar resultado del pago
  private verifyPaymentResult(preferenceId: string): void {
    this.paymentService.verifyPaymentStatus(preferenceId).subscribe({
      next: (result) => {
        console.log('✅ Payment verification result:', result);
        
        if (result.data.status === 'approved') {
          this.handleSuccessfulPayment(result.data);
        } else if (result.data.status === 'pending') {
          this.handlePendingPayment(result.data);
        } else {
          this.handleFailedPayment(result.data);
        }
      },
      error: (error) => {
        console.error('❌ Error verifying payment:', error);
        this.showAlert({
          title: 'Error de Verificación',
          message: 'No pudimos verificar el estado de tu pago. Por favor, contacta al soporte.',
          type: 'error'
        });
      }
    });
  }

  // ✅ NUEVO: Manejar pago exitoso
  private handleSuccessfulPayment(paymentData: any): void {
    this.isSubmitted = true;
    this.checkoutSuccess = true;
    this.checkoutResult = paymentData;
    
    this.showAlert({
      title: '🎉 ¡Pago Exitoso!',
      message: `Tu reserva ha sido confirmada exitosamente.\\n\\nCódigo de confirmación: ${paymentData.confirmationCode}\\nID de reserva: ${paymentData.reservationId}\\n\\nSe ha enviado un email con los detalles.`,
      type: 'success',
      confirmText: 'Entendido'
    });
  }

  // ✅ NUEVO: Manejar pago pendiente
  private handlePendingPayment(paymentData: any): void {
    this.showAlert({
      title: 'Pago Pendiente',
      message: `Tu pago está siendo procesado.\\n\\nID de reserva: ${paymentData.reservationId}\\nTe notificaremos cuando se confirme la reserva.`,
      type: 'warning'
    });
  }

  // ✅ NUEVO: Manejar pago fallido
  private handleFailedPayment(paymentData: any): void {
    this.showAlert({
      title: 'Pago No Completado',
      message: `Tu pago no pudo ser procesado.\\n\\nPuedes intentar nuevamente o contactar al soporte si el problema persiste.`,
      type: 'error'
    });
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
    if (!dateAvailability.available || !dateAvailability.date) {
      this.showAlert({
        title: 'Fecha No Disponible',
        message: 'Esta fecha no está disponible para reservas. Por favor, selecciona otra fecha.',
        type: 'warning'
      });
      return;
    }

    const selectedDate = new Date(dateAvailability.date);

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
      
      // ✅ NUEVO: Calcular conversión a ARS
      this.priceInfo = this.currencyService.getPriceInfo(totalPrice);
      
      this.availabilityResult = {
        available: true,
        totalPrice: totalPrice
      };
      
      console.log('💰 Precio calculado:', {
        usd: totalPrice,
        ars: this.priceInfo.amountARS,
        rate: this.priceInfo.exchangeRate
      });
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
        console.log('✅ Availability check result:', result);
        window.scrollTo({ top: 350, behavior: 'smooth' });
        this.availabilityResult = result;
        this.isLoading = false;
        
        if (result.available) {
          this.showBookingForm = true;
        } else {
          this.showAlert({
            title: 'Fechas No Disponibles',
            message: result.message || 'Lo sentimos, las fechas seleccionadas ya no están disponibles o no hay suficiente capacidad para el número de huéspedes. Por favor, elige otras fechas o reduce el número de huéspedes.',
            type: 'error',
            confirmText: 'Seleccionar otras fechas'
          });
          this.resetDateSelection();
        }
      },
      error: (error) => {
        console.error('❌ Error checking availability:', error);
        this.isLoading = false;
        this.showAlert({
          title: 'Error de Verificación',
          message: error.message || 'Ocurrió un error al verificar la disponibilidad. Por favor, intenta de nuevo.',
          type: 'error',
          confirmText: 'Reintentar'
        });
      }
    });
  }

  // ✅ NUEVO: Procesar reserva con Checkout Pro
  async submitReservation(): Promise<void> {
    if (this.reservationForm.invalid || !this.selectedCheckIn || !this.selectedCheckOut) {
      this.markFormGroupTouched(this.reservationForm);
      return;
    }
    
    // Asegurar que tenemos la información de precio actualizada
    if (!this.priceInfo) {
      console.warn('⚠️ priceInfo no existe, calculando ahora...');
      this.priceInfo = this.currencyService.getPriceInfo(this.availabilityResult?.totalPrice || 0);
    }
    
    console.log('💰 PriceInfo antes de enviar:', this.priceInfo);
    console.log('💵 Total USD:', this.availabilityResult?.totalPrice);
    console.log('💵 Total ARS:', this.priceInfo.amountARS);
    console.log('💱 Exchange Rate:', this.priceInfo.exchangeRate);
    
    // Preparar datos de la reserva
    const reservationData = {
      name: this.reservationForm.value.name,
      email: this.reservationForm.value.email,
      phone: this.reservationForm.value.phone,
      checkIn: this.selectedCheckIn,
      checkOut: this.selectedCheckOut,
      guests: this.reservationForm.value.guests,
      specialRequests: this.reservationForm.value.specialRequests || '',
      totalAmount: this.availabilityResult?.totalPrice || 0,
      totalAmountARS: this.priceInfo.amountARS,
      exchangeRate: this.priceInfo.exchangeRate
    };

    console.log('🚀 Datos completos a enviar:', reservationData);

    this.isProcessingCheckout = true;
    this.checkoutError = null;

    try {
      // Procesar con Checkout Pro (redirige automáticamente)
      const result = await this.paymentService.processPayment(reservationData);
      
      // Este código normalmente no se ejecutará porque hay redirección
      console.log('✅ Checkout Pro initiated:', result);
      
    } catch (error) {
      console.error('❌ Checkout Pro failed:', error);
      this.isProcessingCheckout = false;
      this.checkoutError = 'Error al iniciar el proceso de pago';
      
      this.showAlert({
        title: 'Error en el Pago',
        message: `No pudimos iniciar el proceso de pago: ${this.checkoutError}\\n\\nPor favor, verifica tus datos e intenta nuevamente.`,
        type: 'error'
      });
    }
  }

  // ✅ NUEVO: Reintentar checkout
  retryCheckout(): void {
    this.checkoutError = null;
    this.submitReservation();
  }

  // Métodos auxiliares para el calendario
  getDaysInMonth(): DateAvailability[] {
    if (!this.currentMonth) return [];
    
    // Create dates ensuring they're in the correct timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = this.currentMonth.days.map(day => {
      // Handle date which can be either string or Date
      let date: Date;
      if (typeof day.date === 'string') {
        // Parse the date string (YYYY-MM-DD) and create a Date object at noon UTC
        const [year, month, dayOfMonth] = day.date.split('-').map(Number);
        date = new Date(year, month - 1, dayOfMonth);
      } else {
        // If it's already a Date, ensure it's at noon UTC
        date = new Date(day.date);
      }
      
      // Disable today and past dates
      const available = day.available && isAfter(date, today);

      return {
        ...day,
        date,
        available
      };
    });

    if (days.length === 0) return [];

    const firstDay = days[0].date;
    const lastDay = days[days.length - 1].date;
    
    // Get weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let firstDayOfWeek = firstDay.getDay();
    // Convert to Monday-Sunday format (0 = Monday, ..., 6 = Sunday)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Add padding days at the start to align correctly
    const startPaddingDays: DateAvailability[] = Array(firstDayOfWeek).fill(null).map(() => ({
      date: new Date(0), // Use epoch as padding date
      available: false,
      availableRooms: 0,
      minPrice: 0,
      maxPrice: 0,
      isPadding: true
    }));
    
    // Calculate days needed to complete required rows
    const totalCurrentDays = startPaddingDays.length + days.length;
    const rowsNeeded = Math.ceil(totalCurrentDays / 7);
    const totalNeededDays = rowsNeeded * 7;
    const endPaddingCount = totalNeededDays - totalCurrentDays;
    
    
    const endPaddingDays: DateAvailability[] = Array(endPaddingCount).fill(null).map(() => ({
      date: new Date(0), // Use epoch as padding date
      available: false,
      availableRooms: 0,
      minPrice: 0,
      maxPrice: 0,
      isPadding: true
    }));
    
    const finalCalendar = [...startPaddingDays, ...days, ...endPaddingDays];
    

    return finalCalendar;
  }

  getMonthName(): string {
    return format(this.currentDate, 'MMMM yyyy', { locale: es });
  }

  isDateSelected(date: string | Date): boolean {
    if (!date || !this.selectedCheckIn) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (this.selectedCheckOut) {
      return (isSameDay(dateObj, this.selectedCheckIn) || 
              isSameDay(dateObj, this.selectedCheckOut) ||
              (isAfter(dateObj, this.selectedCheckIn) && isBefore(dateObj, this.selectedCheckOut)));
    }
    
    return isSameDay(dateObj, this.selectedCheckIn);
  }

  isDateInRange(date: string | Date): boolean {
    if (!date || !this.selectedCheckIn || !this.selectedCheckOut) return false;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isAfter(dateObj, this.selectedCheckIn) && isBefore(dateObj, this.selectedCheckOut);
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
    if (!date) return false;
    const currentMonthStart = startOfMonth(this.currentDate);
    const currentMonthEnd = endOfMonth(this.currentDate);
    return date >= currentMonthStart && date <= currentMonthEnd;
  }

  // Reiniciar formulario
  resetForm(): void {
    this.isSubmitted = false;
    this.showBookingForm = false;
    this.selectedCheckIn = null;
    this.selectedCheckOut = null;
    this.availabilityResult = null;
    this.createdReservation = null;
    this.checkoutResult = null;
    this.checkoutSuccess = false;
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

  // Formatear moneda
  formatCurrency(amount: number): string {
    return this.reservationService.formatCurrency(amount);
  }

  // Navegar a búsqueda de reservas
  navigateToLookup(): void {
    this.router.navigate(['/mi-reserva']);
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