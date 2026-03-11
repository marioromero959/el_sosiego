import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="payment-failure-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-10 col-lg-8">
            <div class="card shadow-lg">
              <div class="card-body text-center p-4 p-md-5">
              
              <!-- Loading State -->
              <div *ngIf="isLoading" class="mb-4">
                <div class="spinner-border text-danger mb-4" role="status">
                  <span class="visually-hidden">Verificando pago...</span>
                </div>
                <h3 class="mb-3">Verificando el estado del pago...</h3>
                <p class="text-muted">Por favor espera mientras confirmamos la información.</p>
              </div>

              <!-- Failure State -->
              <div *ngIf="!isLoading">
                <div class="text-danger mb-4">
                  <i class="fas fa-times-circle" style="font-size: 5rem;"></i>
                </div>
                <h2 class="text-danger mb-3">Pago No Completado</h2>
                <p class="lead mb-4">Tu pago no pudo ser procesado exitosamente.</p>
                
                <div class="alert alert-danger d-flex align-items-center mb-4" *ngIf="errorMessage">
                  <i class="fas fa-exclamation-circle fs-4 me-3"></i>
                  <div class="text-start">
                    <strong>Motivo del rechazo</strong><br>
                    <small>{{ errorMessage }}</small>
                  </div>
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

                <div class="d-grid gap-3 d-md-flex justify-content-md-center">
                  <a routerLink="/reservar" class="btn btn-primary">
                    <i class="fas fa-redo me-2"></i>
                    Intentar Nuevamente
                  </a>
                  <a routerLink="/contacto" class="btn btn-outline-danger">
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
    .payment-failure-page {
      min-height: calc(100vh - 200px);
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 140px 0 60px;
    }

    .card {
      border: none;
      border-radius: 20px;
      overflow: hidden;
    }

    .card-body {
      background: white;
    }

    .fas {
      opacity: 0.9;
    }

    .btn {
      padding: 10px 25px;
      border-radius: 25px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 3px 10px rgba(0,0,0,0.15);
    }

    .btn-lg {
      padding: 14px 35px;
      border-radius: 30px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .btn-lg:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .spinner-border {
      width: 3rem;
      height: 3rem;
      border-width: 0.3rem;
    }

    .alert {
      border-radius: 12px;
      border: none;
    }

    h2 {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
    }

    h3, h6 {
      font-family: 'Raleway', sans-serif;
      font-weight: 600;
    }

    .lead {
      font-size: 1.15rem;
      color: #6c757d;
    }

    .list-unstyled li {
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }

    .list-unstyled li:hover {
      transform: translateX(5px);
    }

    @media (max-width: 768px) {
      .payment-failure-page {
        padding: 100px 0 30px;
      }
      
      .btn {
        padding: 8px 20px;
        font-size: 0.9rem;
      }
      
      .btn-lg {
        padding: 12px 25px;
        font-size: 0.9rem;
      }
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
        if (!this.errorMessage) {
          this.errorMessage = 'No se encontró información de pago en esta página.';
        }
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