import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment-failure',
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
                <div class="spinner-border text-danger mb-3" role="status">
                  <span class="visually-hidden">Verificando pago...</span>
                </div>
                <h3>Verificando el estado del pago...</h3>
                <p class="text-muted">Por favor espera mientras confirmamos la información.</p>
              </div>

              <!-- Failure State -->
              <div *ngIf="!isLoading">
                <div class="text-danger mb-4">
                  <i class="fas fa-times-circle" style="font-size: 4rem;"></i>
                </div>
                <h2 class="text-danger mb-3">Pago No Completado</h2>
                <p class="lead mb-4">Tu pago no pudo ser procesado exitosamente.</p>
                
                <div class="alert alert-danger" *ngIf="errorMessage">
                  <strong>Motivo:</strong> {{ errorMessage }}
                </div>
                
                <div class="alert alert-info">
                  <h6 class="alert-heading">¿Qué puedes hacer?</h6>
                  <ul class="list-unstyled mb-0 text-start">
                    <li class="mb-2">
                      <i class="fas fa-check-circle text-success me-2"></i>
                      Verificar los datos de tu tarjeta
                    </li>
                    <li class="mb-2">
                      <i class="fas fa-check-circle text-success me-2"></i>
                      Asegurarte de tener fondos suficientes
                    </li>
                    <li class="mb-2">
                      <i class="fas fa-check-circle text-success me-2"></i>
                      Contactar a tu banco si el problema persiste
                    </li>
                    <li class="mb-0">
                      <i class="fas fa-check-circle text-success me-2"></i>
                      Intentar con otro método de pago
                    </li>
                  </ul>
                </div>

                <div class="mb-4">
                  <p class="text-muted">
                    No te preocupes, tus datos están seguros y no se ha realizado ningún cargo.
                  </p>
                </div>

                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                  <a routerLink="/reservar" class="btn btn-primary btn-lg">
                    <i class="fas fa-redo me-2"></i>
                    Intentar Nuevamente
                  </a>
                  <a routerLink="/contacto" class="btn btn-outline-secondary btn-lg">
                    <i class="fas fa-headset me-2"></i>
                    Contactar Soporte
                  </a>
                </div>

                <div class="mt-4">
                  <a routerLink="/" class="text-muted text-decoration-none">
                    <i class="fas fa-home me-1"></i>
                    Volver al Inicio
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
    .fas {
      opacity: 0.8;
    }
    .btn-lg {
      padding: 12px 30px;
      border-radius: 25px;
    }
    .alert {
      border-radius: 10px;
    }
    .list-unstyled li {
      transition: all 0.2s ease;
    }
    .list-unstyled li:hover {
      transform: translateX(5px);
    }
  `]
})
export class PaymentFailureComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  preferenceId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Obtener información de los parámetros de consulta
    this.route.queryParams.subscribe(params => {
      this.preferenceId = params['preference_id'] || params['id'];
      
      // Obtener mensaje de error si está disponible
      const status = params['collection_status'] || params['status'];
      const statusDetail = params['status_detail'];
      
      if (statusDetail) {
        this.errorMessage = this.getErrorMessage(statusDetail);
      } else if (status) {
        this.errorMessage = this.getErrorMessage(status);
      }
      
      if (this.preferenceId) {
        this.verifyPayment();
      } else {
        this.isLoading = false;
      }
    });
  }

  private verifyPayment(): void {
    if (!this.preferenceId) return;

    this.paymentService.verifyPaymentStatus(this.preferenceId).subscribe({
      next: (result) => {
        console.log('Payment verification result:', result);
        this.isLoading = false;
        
        // Si el pago fue rechazado, obtener detalles del error
        if (result.data.status === 'rejected' && !this.errorMessage) {
          this.errorMessage = 'El pago fue rechazado por el procesador de pagos';
        }
        
        // Limpiar parámetros de URL
        this.paymentService.cleanUrlParams();
      },
      error: (error) => {
        console.error('Error verifying payment:', error);
        this.isLoading = false;
        if (!this.errorMessage) {
          this.errorMessage = 'No pudimos verificar el estado del pago';
        }
      }
    });
  }

  private getErrorMessage(status: string): string {
    const errorMessages: { [key: string]: string } = {
      'cc_rejected_bad_filled_card_number': 'Número de tarjeta inválido',
      'cc_rejected_bad_filled_date': 'Fecha de vencimiento inválida',
      'cc_rejected_bad_filled_other': 'Datos de tarjeta incompletos o incorrectos',
      'cc_rejected_bad_filled_security_code': 'Código de seguridad inválido',
      'cc_rejected_blacklist': 'Tarjeta bloqueada',
      'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco',
      'cc_rejected_card_disabled': 'Tarjeta deshabilitada',
      'cc_rejected_duplicate_payment': 'Pago duplicado',
      'cc_rejected_high_risk': 'Pago rechazado por seguridad',
      'cc_rejected_insufficient_amount': 'Fondos insuficientes',
      'cc_rejected_invalid_installments': 'Cuotas no válidas',
      'cc_rejected_max_attempts': 'Máximo de intentos alcanzado',
      'cc_rejected_other_reason': 'Pago rechazado por el banco',
      'rejected': 'Pago rechazado',
      'failure': 'Error en el procesamiento del pago',
      'cancelled': 'Pago cancelado por el usuario'
    };

    return errorMessages[status] || 'Error desconocido en el procesamiento del pago';
  }
}