import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body text-center p-5">
              
              <!-- Loading State -->
              <div *ngIf="isLoading" class="mb-4">
                <div class="spinner-border text-success mb-3" role="status">
                  <span class="visually-hidden">Verificando pago...</span>
                </div>
                <h3>Verificando tu pago...</h3>
                <p class="text-muted">Por favor espera mientras confirmamos tu reserva.</p>
              </div>

              <!-- Success State -->
              <div *ngIf="!isLoading && paymentResult?.status === 'approved'">
                <div class="text-success mb-4">
                  <i class="fas fa-check-circle" style="font-size: 4rem;"></i>
                </div>
                <h2 class="text-success mb-3">¡Pago Exitoso!</h2>
                <p class="lead mb-4">Tu reserva ha sido confirmada exitosamente.</p>
                
                <div class="reservation-details bg-light p-4 rounded mb-4">
                  <h5 class="mb-3">Detalles de tu Reserva</h5>
                  <div class="row text-start">
                    <div class="col-sm-6 mb-2">
                      <strong>Código de Confirmación:</strong>
                    </div>
                    <div class="col-sm-6 mb-2">
                      {{ paymentResult.confirmationCode }}
                    </div>
                    <div class="col-sm-6 mb-2">
                      <strong>ID de Reserva:</strong>
                    </div>
                    <div class="col-sm-6 mb-2">
                      {{ paymentResult.reservationId }}
                    </div>
                  </div>
                </div>

                <div class="alert alert-success">
                  <i class="fas fa-envelope me-2"></i>
                  Se ha enviado un email de confirmación con todos los detalles de tu reserva.
                </div>

                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button 
                    class="btn btn-primary btn-lg"
                    (click)="navigateToReservationLookup()">
                    Ver Mi Reserva
                  </button>
                  <a routerLink="/" class="btn btn-outline-secondary btn-lg">
                    Volver al Inicio
                  </a>
                </div>
              </div>

              <!-- Pending State -->
              <div *ngIf="!isLoading && paymentResult?.status === 'pending'">
                <div class="text-warning mb-4">
                  <i class="fas fa-clock" style="font-size: 4rem;"></i>
                </div>
                <h2 class="text-warning mb-3">Pago Pendiente</h2>
                <p class="lead mb-4">Tu pago está siendo procesado.</p>
                
                <div class="alert alert-warning">
                  <strong>ID de Reserva:</strong> {{ paymentResult.reservationId }}<br>
                  Te notificaremos por email cuando se confirme tu reserva.
                </div>

                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button 
                    class="btn btn-warning btn-lg"
                    (click)="navigateToReservationLookup()">
                    Consultar Estado
                  </button>
                  <a routerLink="/" class="btn btn-outline-secondary btn-lg">
                    Volver al Inicio
                  </a>
                </div>
              </div>

              <!-- Error State -->
              <div *ngIf="!isLoading && (!paymentResult || paymentResult.status === 'rejected')">
                <div class="text-danger mb-4">
                  <i class="fas fa-exclamation-triangle" style="font-size: 4rem;"></i>
                </div>
                <h2 class="text-danger mb-3">Error en el Pago</h2>
                <p class="lead mb-4">No pudimos verificar el estado de tu pago.</p>
                
                <div class="alert alert-danger">
                  Por favor, contacta con nuestro equipo de soporte o intenta realizar la reserva nuevamente.
                </div>

                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                  <a routerLink="/reservar" class="btn btn-primary btn-lg">
                    Intentar Nuevamente
                  </a>
                  <a routerLink="/contacto" class="btn btn-outline-danger btn-lg">
                    Contactar Soporte
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 15px;
    }
    .reservation-details {
      border-radius: 10px;
    }
    .fas {
      opacity: 0.8;
    }
    .btn-lg {
      padding: 12px 30px;
      border-radius: 25px;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  isLoading = true;
  paymentResult: any = null;
  preferenceId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Obtener el preferenceId de los parámetros de consulta
    this.route.queryParams.subscribe(params => {
      this.preferenceId = params['preference_id'] || params['id'];
      
      if (this.preferenceId) {
        this.verifyPayment();
      } else {
        this.isLoading = false;
        console.error('No preference ID found in URL parameters');
      }
    });
  }

  private verifyPayment(): void {
    if (!this.preferenceId) return;

    this.paymentService.verifyPaymentStatus(this.preferenceId).subscribe({
      next: (result) => {
        console.log('Payment verification result:', result);
        this.paymentResult = result.data;
        this.isLoading = false;
        
        // Limpiar parámetros de URL
        this.paymentService.cleanUrlParams();
      },
      error: (error) => {
        console.error('Error verifying payment:', error);
        this.isLoading = false;
        this.paymentResult = { status: 'error' };
      }
    });
  }

  navigateToReservationLookup(): void {
    this.router.navigate(['/mi-reserva']);
  }
}