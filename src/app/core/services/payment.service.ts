// src/app/core/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ✅ Interfaces simplificadas para pago directo
export interface DirectPaymentData {
  token: string;
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  installments: number;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
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

  constructor(private http: HttpClient) {
    this.initDirectPayment();
  }

  // ✅ Inicializar MercadoPago SDK
  private async initDirectPayment(): Promise<void> {
    try {
      await this.loadMercadoPagoSDK();
      
      this.mp = new (window as any).MercadoPago(environment.publicKey, {
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
  async processDirectPayment(reservationData: DirectPaymentData['reservationData']): Promise<DirectPaymentResult> {
    if (!this.isDirectPaymentReady) {
      throw new Error('Sistema de pago no inicializado');
    }

    try {
      // 1. Crear token de tarjeta de prueba
      const cardToken = await this.createTestCardToken();

      // 2. Preparar datos del pago
      const paymentData: DirectPaymentData = {
        token: cardToken.id,
        transaction_amount: reservationData.totalAmount,
        description: `Reserva Casa de Campo - ${reservationData.name}`,
        payment_method_id: 'visa',
        installments: 1,
        payer: {
          email: reservationData.email,
          identification: {
            type: 'DNI',
            number: '12345678'
          }
        },
        reservationData
      };

      console.log('💳 Procesando pago directo...');

      // 3. Enviar al backend
      const result = await this.http.post<DirectPaymentResult>(`${this.apiUrl}/payments/direct-payment`, paymentData).toPromise();
      
      console.log('✅ Pago procesado:', result);
      return result!;

    } catch (error) {
      console.error('❌ Error processing direct payment:', error);
      throw new Error('Error al procesar el pago');
    }
  }

  // ✅ Crear token de tarjeta de prueba
  private async createTestCardToken(): Promise<any> {
    try {
      return await this.mp.createCardToken({
        cardNumber: '4509953566233704',
        securityCode: '123',
        expirationMonth: '11',
        expirationYear: '25',
        cardholder: {
          name: 'APRO',
          identification: {
            type: 'DNI',
            number: '12345678'
          }
        }
      });
    } catch (error) {
      console.error('❌ Error creating card token:', error);
      throw new Error('Error al crear token de tarjeta');
    }
  }

  // ✅ Verificar si está disponible
  isDirectPaymentAvailable(): boolean {
    return this.isDirectPaymentReady;
  }

  // ✅ Método legacy para compatibilidad (si algo lo usa)
  verifyPaymentStatus(preferenceId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payments/verify/${preferenceId}`);
  }
}