// src/app/core/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrencyService } from './currency.service';

// ✅ Interfaces para Checkout Pro
export interface CheckoutProData {
  transaction_amount: number;
  transaction_amount_ars: number;
  exchange_rate: number;
  description: string;
  reservationData: {
    name: string;
    email: string;
    phone: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    specialRequests?: string;
    totalAmount: number;
    totalAmountARS: number;
    exchangeRate: number;
  };
}

export interface CheckoutProResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  reservationId: number;
  tempId: string;
  status: string;
}

export interface PaymentVerificationResult {
  paymentId: number;
  status: 'pending' | 'approved' | 'rejected';
  reservationId?: number;
  confirmationCode?: string;
  paymentStatus?: string;
  statusReservation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;
  private mp: any = null;
  private isInitialized = false;
  private publicKey: string | undefined;

  constructor(
    private http: HttpClient,
    private currencyService: CurrencyService
  ) {
    this.initializeService();
  }

  // ✅ Inicializar servicio y cargar configuración
  private async initializeService(): Promise<void> {
    try {
      await this.loadConfig();
      await this.loadMercadoPagoSDK();
      
      if (this.publicKey) {
        this.mp = new (window as any).MercadoPago(this.publicKey, {
          locale: 'es-AR'
        });
        this.isInitialized = true;
        console.log('✅ PaymentService initialized with Checkout Pro');
      }
    } catch (error) {
      console.error('❌ Error initializing PaymentService:', error);
    }
  }

  // ✅ Cargar configuración desde el backend
  async loadConfig(): Promise<void> {
    try {
      const config = await this.http.get<any>(`${this.apiUrl}/payments/config`).toPromise();
      this.publicKey = config.data.publicKey;
    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  }

  // ✅ Cargar SDK de MercadoPago
  private loadMercadoPagoSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).MercadoPago) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MercadoPago SDK'));
      document.head.appendChild(script);
    });
  }

  // ✅ NUEVO: Método principal para Checkout Pro
  async processPayment(reservationData: CheckoutProData['reservationData']): Promise<CheckoutProResult> {
    try {
      console.log('🚀 Iniciando Checkout Pro:', reservationData);

      // Verificar que el servicio esté inicializado
      if (!this.isInitialized) {
        await this.initializeService();
      }

      // Los valores ya vienen calculados desde el formulario
      console.log('💱 Datos de pago recibidos:', {
        usd: reservationData.totalAmount,
        ars: reservationData.totalAmountARS,
        rate: reservationData.exchangeRate
      });

      // Preparar datos para la preferencia con monto en ARS
      // IMPORTANTE: Sobrescribir totalAmount con el valor en ARS para que el backend lo use
      const checkoutData: CheckoutProData = {
        transaction_amount: reservationData.totalAmountARS, // ARS (para MercadoPago)
        transaction_amount_ars: reservationData.totalAmountARS, // ARS (para referencia)
        exchange_rate: reservationData.exchangeRate,
        description: `Reserva Casa de Campo El Sosiego - ${reservationData.name}`,
        reservationData: {
          ...reservationData,
          totalAmount: reservationData.totalAmountARS // ⚠️ CAMBIO: enviar ARS como totalAmount
        }
      };

      console.log('📤 Enviando al backend:', checkoutData);
      console.log('📤 Transaction amount (debe ser ARS):', checkoutData.transaction_amount);
      console.log('📤 ReservationData.totalAmount (debe ser ARS):', checkoutData.reservationData.totalAmount);

      // Crear preferencia en el backend
      const result = await this.http.post<{data: CheckoutProResult}>(
        `${this.apiUrl}/payments/create-preference`, 
        checkoutData
      ).toPromise();

      if (!result?.data) {
        throw new Error('No se pudo crear la preferencia de pago');
      }

      console.log('✅ Checkout Pro preference created:', result.data);

      // Redirigir automáticamente a MercadoPago
      this.redirectToCheckout(result.data.initPoint);

      return result.data;

    } catch (error) {
      console.error('❌ Error processing Checkout Pro:', error);
      throw new Error('Error al procesar el pago: ' + (error as any).message);
    }
  }

  // ✅ Redirigir a Checkout Pro
  private redirectToCheckout(initPoint: string): void {
    console.log('🔄 Redirecting to Checkout Pro:', initPoint);
    window.location.href = initPoint;
  }

  // ✅ Verificar estado del pago (para usar en páginas de retorno)
  verifyPaymentStatus(preferenceId: string): Observable<{data: PaymentVerificationResult}> {
    return this.http.get<{data: PaymentVerificationResult}>(
      `${this.apiUrl}/payments/verify/${preferenceId}`
    );
  }

  // ✅ Obtener estado de reserva
  getReservationStatus(confirmationCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reservations/status/${confirmationCode}`);
  }

  // ✅ NUEVO: Abrir Checkout Pro en modal (opcional)
  async openCheckoutModal(preferenceId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initializeService();
      }

      const checkout = this.mp.checkout({
        preference: {
          id: preferenceId
        },
        autoOpen: true, // Abrir automáticamente
      });

      console.log('🔄 Checkout modal opened');
      
    } catch (error) {
      console.error('❌ Error opening checkout modal:', error);
      throw error;
    }
  }

  // ✅ NUEVO: Manejar parámetros de retorno de URL
  handleReturnFromCheckout(): {status: string, preferenceId?: string, paymentId?: string} | null {
    const urlParams = new URLSearchParams(window.location.search);
    
    const status = urlParams.get('collection_status') || urlParams.get('status');
    const preferenceId = urlParams.get('preference_id');
    const paymentId = urlParams.get('payment_id') || urlParams.get('collection_id');
    
    if (status) {
      return {
        status,
        preferenceId: preferenceId || undefined,
        paymentId: paymentId || undefined
      };
    }
    
    return null;
  }

  // ✅ Limpiar parámetros de URL después del procesamiento
  cleanUrlParams(): void {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, document.title, url.toString());
  }
}