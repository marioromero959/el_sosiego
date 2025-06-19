// src/app/core/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ✅ Interfaces simplificadas para pago directo
export interface DirectPaymentData {
  transaction_amount: number;
  description: string;
  installments: number;
  payer: {
    email: string;
  };
  reservationData: {
    name: string;
    email: string;
    phone: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    specialRequests?: string;
    totalAmount: number;
  };
}

export interface DirectPaymentResult {
  id: number;
  status: 'approved' | 'pending' | 'rejected';
  status_detail: string;
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  date_created: string;
  reservationId?: number;
  confirmationCode?: string;
}
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;
  private mp: any = null;
  private isDirectPaymentReady = false;
  private publicKey:string | undefined;

  constructor(private http: HttpClient) {
    this.initDirectPayment();
    this.loadConfig();
  }

  async loadConfig(): Promise<void> {
    const config = await this.http.get<any>(`${this.apiUrl}/payments/config`).toPromise();
    this.publicKey = config.data.publicKey;
  }

  // ✅ Inicializar MercadoPago SDK
  private async initDirectPayment(): Promise<void> {
    try {
      await this.loadMercadoPagoSDK();
      
      this.mp = new (window as any).MercadoPago(this.publicKey, {
        locale: 'es-AR'
      });
      
      this.isDirectPaymentReady = true;
      console.log('✅ Direct Payment initialized');
    } catch (error) {
      console.error('❌ Error initializing Direct Payment:', error);
    }
  }

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

  // ✅ Método principal de pago directo
  async processPayment(reservationData: DirectPaymentData['reservationData']): Promise<DirectPaymentResult> {
    try {
      // 2. Preparar datos del pago
      const paymentData: DirectPaymentData = {
        transaction_amount: reservationData.totalAmount,
        description: `Reserva Casa de Campo - ${reservationData.name}`,
        installments: 1,
        payer: {
          email: reservationData.email,
        },
        reservationData
      };

      // 3. Enviar al backend
      const result = await this.http.post<DirectPaymentResult>(`${this.apiUrl}/payments/payment`, paymentData).toPromise();
      
      console.log('✅ Pago procesado:', result);
      return result!;

    } catch (error) {
      console.error('❌ Error processing direct payment:', error);
      throw new Error('Error al procesar el pago');
    }
  }

  verifyPaymentStatus(preferenceId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payments/verify/${preferenceId}`);
  }
}