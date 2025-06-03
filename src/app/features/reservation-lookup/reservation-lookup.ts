import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservationNew } from '../../core/models/reservation.model';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-reservation-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="reservation-lookup-container">
      <!-- Header -->
      <div class="header-section text-center mb-5">
        <h1 class="display-4 mb-3">🔍 Buscar Mi Reserva</h1>
        <p class="lead text-muted">
          Ingresa tu código de confirmación para ver los detalles de tu reserva
        </p>
      </div>

      <!-- Formulario de Búsqueda -->
      <div class="search-section" *ngIf="!foundReservation">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-body p-4">
                <form [formGroup]="searchForm" (ngSubmit)="searchReservation()">
                  <div class="mb-4">
                    <label for="confirmationCode" class="form-label fw-semibold">
                      <i class="fas fa-ticket-alt me-2"></i>
                      Código de Confirmación
                    </label>
                    <input 
                      type="text" 
                      class="form-control form-control-lg"
                      id="confirmationCode"
                      formControlName="confirmationCode"
                      placeholder="Ej: ES123456ABC"
                      [class.is-invalid]="searchForm.get('confirmationCode')?.invalid && searchForm.get('confirmationCode')?.touched"
                    >
                    <div 
                      class="invalid-feedback"
                      *ngIf="searchForm.get('confirmationCode')?.invalid && searchForm.get('confirmationCode')?.touched"
                    >
                      <small *ngIf="searchForm.get('confirmationCode')?.errors?.['required']">
                        El código de confirmación es requerido
                      </small>
                      <small *ngIf="searchForm.get('confirmationCode')?.errors?.['minlength']">
                        El código debe tener al menos 6 caracteres
                      </small>
                    </div>
                    <small class="form-text text-muted">
                      El código fue enviado a tu email al crear la reserva
                    </small>
                  </div>

                  <div class="d-grid">
                    <button 
                      type="submit" 
                      class="btn btn-primary btn-lg"
                      [disabled]="searchForm.invalid || isLoading"
                    >
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="fas fa-search me-2" *ngIf="!isLoading"></i>
                      {{ isLoading ? 'Buscando...' : 'Buscar Reserva' }}
                    </button>
                  </div>
                </form>

                <!-- Error Message -->
                <div class="alert alert-danger mt-3" *ngIf="errorMessage">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <div class="text-center mt-4">
              <h6 class="text-muted mb-3">¿No tienes tu código?</h6>
              <p class="small text-muted">
                <i class="fas fa-envelope me-1"></i>
                Revisa tu email (incluyendo spam) o
                <a href="https://wa.me/573213456789" target="_blank" class="text-decoration-none">
                  <i class="fab fa-whatsapp me-1"></i>
                  contáctanos por WhatsApp
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados de la Reserva -->
      <div class="reservation-details" *ngIf="foundReservation">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            
            <!-- Encabezado de la reserva -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-success text-white">
                <div class="row align-items-center">
                  <div class="col">
                    <h4 class="card-title mb-0">
                      <i class="fas fa-check-circle me-2"></i>
                      Reserva Confirmada
                    </h4>
                  </div>
                  <div class="col-auto">
                    <span class="badge bg-light text-dark fs-6">
                      {{ foundReservation.confirmationCode }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2">
                      <i class="fas fa-user me-2"></i>Información del Huésped
                    </h6>
                    <p class="mb-1"><strong>{{ foundReservation.name }}</strong></p>
                    <p class="mb-1 text-muted">
                      <i class="fas fa-envelope me-1"></i>{{ foundReservation.email }}
                    </p>
                    <p class="mb-0 text-muted">
                      <i class="fas fa-phone me-1"></i>{{ foundReservation.phone }}
                    </p>
                  </div>
                  
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2">
                      <i class="fas fa-info-circle me-2"></i>Estado de la Reserva
                    </h6>
                    <span class="badge fs-6" [ngClass]="getStatusBadgeClass(foundReservation.statusReservation)">
                      {{ getStatusText(foundReservation.statusReservation) }}
                    </span>
                    <p class="mb-0 mt-2 small text-muted" *ngIf="foundReservation.createdAt">
                      Creada el {{ formatDate(foundReservation.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detalles de las fechas -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-calendar-alt me-2"></i>
                  Detalles de la Estadía
                </h5>
              </div>
              
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-md-3">
                    <div class="border-end pe-3">
                      <h6 class="text-muted mb-1">Check-in</h6>
                      <p class="h5 mb-0 text-primary">{{ formatDateShort(foundReservation.checkIn) }}</p>
                      <small class="text-muted">{{ formatDayName(foundReservation.checkIn) }}</small>
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <div class="border-end pe-3">
                      <h6 class="text-muted mb-1">Check-out</h6>
                      <p class="h5 mb-0 text-primary">{{ formatDateShort(foundReservation.checkOut) }}</p>
                      <small class="text-muted">{{ formatDayName(foundReservation.checkOut) }}</small>
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <div class="border-end pe-3">
                      <h6 class="text-muted mb-1">Noches</h6>
                      <p class="h5 mb-0 text-info">{{ calculateNights() }}</p>
                      <small class="text-muted">{{ calculateNights() === 1 ? 'noche' : 'noches' }}</small>
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <h6 class="text-muted mb-1">Huéspedes</h6>
                    <p class="h5 mb-0 text-info">{{ foundReservation.guests }}</p>
                    <small class="text-muted">{{ foundReservation.guests === 1 ? 'persona' : 'personas' }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información financiera -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-dollar-sign me-2"></i>
                  Información de Pago
                </h5>
              </div>
              
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2">Total de la Reserva</h6>
                    <p class="h3 mb-0 text-success">
                      {{ formatCurrency(foundReservation.totalPrice) }}
                    </p>
                    <small class="text-muted">
                      {{ calculateNights() }} {{ calculateNights() === 1 ? 'noche' : 'noches' }} × 
                      {{ formatCurrency(foundReservation.totalPrice / calculateNights()) }}
                    </small>
                  </div>
                  
                  <div class="col-md-6 text-md-end">
                    <p class="mb-1">
                      <span class="badge bg-warning text-dark">
                        <i class="fas fa-info-circle me-1"></i>
                        Pago al llegar
                      </span>
                    </p>
                    <small class="text-muted">
                      Aceptamos efectivo y transferencias
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Solicitudes especiales -->
            <div class="card shadow-sm mb-4" *ngIf="foundReservation.specialRequests">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-star me-2"></i>
                  Solicitudes Especiales
                </h5>
              </div>
              
              <div class="card-body">
                <p class="mb-0">{{ foundReservation.specialRequests }}</p>
              </div>
            </div>

            <!-- Acciones -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-tools me-2"></i>
                  Acciones Disponibles
                </h5>
              </div>
              
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-4">
                    <button 
                      class="btn btn-outline-primary w-100"
                      (click)="resendConfirmationEmail()"
                      [disabled]="isResending"
                    >
                      <span *ngIf="isResending" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="fas fa-envelope me-2" *ngIf="!isResending"></i>
                      {{ isResending ? 'Enviando...' : 'Reenviar Email' }}
                    </button>
                  </div>
                  
                  <div class="col-md-4">
                    <a 
                      [href]="getWhatsAppUrl()" 
                      target="_blank"
                      class="btn btn-outline-success w-100"
                    >
                      <i class="fab fa-whatsapp me-2"></i>
                      Contactar por WhatsApp
                    </a>
                  </div>
                  
                  <div class="col-md-4">
                    <button 
                      class="btn btn-outline-secondary w-100"
                      (click)="printReservation()"
                    >
                      <i class="fas fa-print me-2"></i>
                      Imprimir Reserva
                    </button>
                  </div>
                </div>

                <!-- Mensaje de email reenviado -->
                <div class="alert alert-success mt-3" *ngIf="emailResentMessage">
                  <i class="fas fa-check-circle me-2"></i>
                  {{ emailResentMessage }}
                </div>
              </div>
            </div>

            <!-- Botón para buscar otra reserva -->
            <div class="text-center">
              <button 
                class="btn btn-link text-muted"
                (click)="searchAnother()"
              >
                <i class="fas fa-search me-2"></i>
                Buscar otra reserva
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reservation-lookup-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 2rem 0;
    }

    .card {
      border: none;
      border-radius: 15px;
    }

    .card-header {
      border-radius: 15px 15px 0 0 !important;
      border-bottom: none;
      padding: 1.5rem;
    }

    .form-control-lg {
      border-radius: 10px;
      padding: 0.75rem 1rem;
    }

    .btn {
      border-radius: 10px;
      padding: 0.5rem 1.5rem;
    }

    .btn-lg {
      padding: 0.75rem 2rem;
    }

    .badge {
      border-radius: 8px;
      padding: 0.5rem 1rem;
    }

    .border-end {
      border-right: 1px solid #dee2e6 !important;
    }

    @media (max-width: 768px) {
      .border-end {
        border-right: none !important;
        border-bottom: 1px solid #dee2e6 !important;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
      }
    }

    .reservation-lookup-container h1 {
      color: #2c3e50;
      font-weight: 700;
    }

    .lead {
      font-size: 1.1rem;
    }

    .alert {
      border-radius: 10px;
    }

    @media print {
      .btn, .alert, .card-header h5 i {
        display: none !important;
      }
    }
  `]
})
export class ReservationLookupComponent implements OnInit {
  searchForm!: FormGroup;
  foundReservation: ReservationNew | null = null;
  isLoading: boolean = false;
  isResending: boolean = false;
  errorMessage: string = '';
  emailResentMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      confirmationCode: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  searchReservation(): void {
    if (this.searchForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const confirmationCode = this.searchForm.value.confirmationCode.trim().toUpperCase();
    this.isLoading = true;
    this.errorMessage = '';

    console.log('🔍 Searching for reservation with code:', confirmationCode);

    this.reservationService.findByConfirmationCode(confirmationCode)
      .subscribe({
        next: (response) => {
          console.log('✅ Reservation found:', response);
          this.isLoading = false;
          
          if (response.success && response.reservation) {
            this.foundReservation = response.reservation;
          } else {
            this.errorMessage = response.message || 'No se encontró ninguna reserva con ese código';
          }
        },
        error: (error) => {
          console.error('❌ Error searching reservation:', error);
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al buscar la reserva. Por favor, intenta de nuevo.';
        }
      });
  }

  resendConfirmationEmail(): void {
    if (!this.foundReservation?.id) return;

    this.isResending = true;
    this.emailResentMessage = '';

    this.reservationService.sendConfirmationEmail(this.foundReservation.id)
      .subscribe({
        next: (response) => {
          this.isResending = false;
          if (response.success) {
            this.emailResentMessage = response.message;
            // Limpiar mensaje después de 5 segundos
            setTimeout(() => {
              this.emailResentMessage = '';
            }, 5000);
          }
        },
        error: (error) => {
          this.isResending = false;
          this.emailResentMessage = 'Error al reenviar el email. Por favor, intenta de nuevo.';
          // Limpiar mensaje después de 5 segundos
          setTimeout(() => {
            this.emailResentMessage = '';
          }, 5000);
        }
      });
  }

  getWhatsAppUrl(): string {
    if (!this.foundReservation) return '';
    return this.reservationService.generateWhatsAppUrl(this.foundReservation);
  }

  printReservation(): void {
    window.print();
  }

  searchAnother(): void {
    this.foundReservation = null;
    this.errorMessage = '';
    this.emailResentMessage = '';
    this.searchForm.reset();
  }

  // Métodos de formateo
  formatDate(date: Date): string {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  }

  formatDateShort(date: Date): string {
    return format(date, 'dd/MM/yyyy', { locale: es });
  }

  formatDayName(date: Date): string {
    return format(date, 'EEEE', { locale: es });
  }

  formatCurrency(amount: number): string {
    return this.reservationService.formatCurrency(amount);
  }

  calculateNights(): number {
    if (!this.foundReservation) return 0;
    return differenceInDays(this.foundReservation.checkOut, this.foundReservation.checkIn);
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classMap: {[key: string]: string} = {
      'pending': 'bg-warning text-dark',
      'confirmed': 'bg-success',
      'cancelled': 'bg-danger'
    };
    return classMap[status] || 'bg-secondary';
  }

  private markFormGroupTouched(): void {
    Object.values(this.searchForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }
}