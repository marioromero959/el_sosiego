import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="payment-success-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-10 col-lg-8">
            <div class="card shadow-lg">
              <div class="card-body text-center p-4 p-md-5">
              
              <!-- Loading State -->
              <div *ngIf="isLoading" class="mb-4">
                <div class="spinner-border text-success mb-4" role="status">
                  <span class="visually-hidden">Verificando pago...</span>
                </div>
                <h3 class="mb-3">Verificando tu pago...</h3>
                <p class="text-muted">Por favor espera mientras confirmamos tu reserva.</p>
              </div>

              <!-- Success State -->
              <div *ngIf="!isLoading && paymentResult?.status === 'approved'">
                <div class="text-success mb-4">
                  <i class="fas fa-check-circle" style="font-size: 5rem;"></i>
                </div>
                <h2 class="text-success mb-3">¡Reserva Confirmada!</h2>
                <p class="lead mb-4">Tu pago ha sido procesado exitosamente.</p>
                
                <div class="reservation-details p-4 rounded mb-4">
                  <h5 class="mb-4 text-dark"><i class="fas fa-calendar-check me-2"></i>Detalles de tu Reserva</h5>
                  <div class="row text-start g-3">
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center py-2 px-3 bg-white rounded">
                        <strong class="text-secondary">Código de Confirmación:</strong>
                        <span class="badge bg-success fs-6">{{ paymentResult.confirmationCode }}</span>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center py-2 px-3 bg-white rounded">
                        <strong class="text-secondary">ID de Reserva:</strong>
                        <span class="text-dark fw-bold">#{{ paymentResult.reservationId }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="alert alert-success d-flex align-items-center">
                  <i class="fas fa-envelope fs-4 me-3"></i>
                  <div class="text-start">
                    <strong>Confirmación enviada</strong><br>
                    <small>Revisa tu email con todos los detalles de tu reserva.</small>
                  </div>
                </div>

                <div class="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                  <button 
                    class="btn btn-success"
                    (click)="navigateToReservationLookup()">
                    <i class="fas fa-search me-2"></i>Ver Mi Reserva
                  </button>
                  <a routerLink="/" class="btn btn-outline-secondary">
                    <i class="fas fa-home me-2"></i>Volver al Inicio
                  </a>
                </div>
              </div>

              <!-- Pending State -->
              <div *ngIf="!isLoading && paymentResult?.status === 'pending'">
                <div class="text-warning mb-4">
                  <i class="fas fa-clock" style="font-size: 5rem;"></i>
                </div>
                <h2 class="text-warning mb-3">Pago en Proceso</h2>
                <p class="lead mb-4">Tu pago está siendo verificado.</p>
                
                <div class="reservation-details p-4 rounded mb-4">
                  <div class="d-flex justify-content-between align-items-center py-2 px-3 bg-white rounded">
                    <strong class="text-secondary">ID de Reserva:</strong>
                    <span class="text-dark fw-bold">#{{ paymentResult.reservationId }}</span>
                  </div>
                </div>

                <div class="alert alert-warning d-flex align-items-center">
                  <i class="fas fa-info-circle fs-4 me-3"></i>
                  <div class="text-start">
                    <strong>Estamos procesando tu pago</strong><br>
                    <small>Te notificaremos por email cuando se confirme tu reserva.</small>
                  </div>
                </div>

                <div class="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                  <button 
                    class="btn btn-warning text-dark"
                    (click)="navigateToReservationLookup()">
                    <i class="fas fa-search me-2"></i>Consultar Estado
                  </button>
                  <a routerLink="/" class="btn btn-outline-secondary">
                    <i class="fas fa-home me-2"></i>Volver al Inicio
                  </a>
                </div>
              </div>

              <!-- Error State -->
              <div *ngIf="!isLoading && (!paymentResult || paymentResult.status === 'rejected' || paymentResult.status === 'error')">
                <div class="text-danger mb-4">
                  <i class="fas fa-exclamation-triangle" style="font-size: 5rem;"></i>
                </div>
                <h2 class="text-danger mb-3">Error en la Verificación</h2>
                <p class="lead mb-4">{{ errorMessage || 'No pudimos verificar el estado de tu pago.' }}</p>
                
                <div class="alert alert-danger d-flex align-items-center">
                  <i class="fas fa-headset fs-4 me-3"></i>
                  <div class="text-start">
                    <strong>¿Necesitas ayuda?</strong><br>
                    <small>Si realizaste el pago, verifica tu reserva en "Mi Reserva" con tu email. Si el problema persiste, contacta con soporte.</small>
                  </div>
                </div>

                <div class="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                  <button 
                    class="btn btn-warning text-dark"
                    (click)="navigateToReservationLookup()">
                    <i class="fas fa-search me-2"></i>Buscar Mi Reserva
                  </button>
                  <a routerLink="/reservar" class="btn btn-primary">
                    <i class="fas fa-redo me-2"></i>Nueva Reserva
                  </a>
                  <a routerLink="/contacto" class="btn btn-outline-danger">
                    <i class="fas fa-headset me-2"></i>Contactar Soporte
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
    .payment-success-page {
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

    .reservation-details {
      border-radius: 12px;
      background: #f8f9fa !important;
      border: 2px solid #e9ecef;
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

    h2 {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
    }

    h3, h5 {
      font-family: 'Raleway', sans-serif;
      font-weight: 600;
    }

    .lead {
      font-size: 1.15rem;
      color: #6c757d;
    }

    @media (max-width: 768px) {
      .payment-success-page {
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
export class PaymentSuccessComponent implements OnInit {
  isLoading = true;
  paymentResult: any = null;
  preferenceId: string | null = null;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient  // Usar HttpClient directamente
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('🔍 URL Params recibidos:', params);
      
      // ✅ PRIORIZAR external_reference (ID de reserva real)
      this.preferenceId = params['external_reference'] || 
                          params['preference_id'] || 
                          params['id'];
      
      if (this.preferenceId) {
        // Pasar todos los params relevantes al verify
        this.verifyPayment(params);
      } else {
        this.isLoading = false;
        this.paymentResult = { status: 'error' };
        this.errorMessage = 'No se encontró información de pago en esta página.';
      }
    });
  }

  private verifyPayment(mercadoPagoParams: any): void {
    if (!this.preferenceId) return;

    // Construir query string con los parámetros de MercadoPago
    const queryParams = new URLSearchParams();
    if (mercadoPagoParams['payment_id']) {
      queryParams.append('payment_id', mercadoPagoParams['payment_id']);
    }
    if (mercadoPagoParams['external_reference']) {
      queryParams.append('external_reference', mercadoPagoParams['external_reference']);
    }
    
    const url = `${environment.apiUrl}/api/payments/verify/${this.preferenceId}?${queryParams.toString()}`;
    
    console.log('📞 Calling verify endpoint:', url);

    this.http.get<any>(url).subscribe({
      next: (result) => {
        console.log('✅ Payment verification result:', result);
        this.paymentResult = result.data;
        this.isLoading = false;
        
        // Limpiar parámetros de URL (opcional)
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });
      },
      error: (error) => {
        console.error('❌ Error verifying payment:', error);
        this.isLoading = false;
        this.paymentResult = { status: 'error' };
        this.errorMessage = error.error?.message || 'No se pudo verificar el estado del pago. Por favor, verifica tu reserva en "Mi Reserva".';
      }
    });
  }

  navigateToReservationLookup(): void {
    this.router.navigate(['/mi-reserva']);
  }
}