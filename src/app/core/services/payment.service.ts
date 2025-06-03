import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentPreference {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  publicKey: string;
  paymentId: number;
}

export interface CreatePaymentPreferenceData {
  description: string;
  customerEmail: string;
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

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createPaymentPreference(data: CreatePaymentPreferenceData): Observable<PaymentPreference> {
    return this.http.post<PaymentPreference>(`${this.apiUrl}/payments/create-preference`, data);
  }

  // Método para verificar el estado del pago
  verifyPaymentStatus(preferenceId: string): Observable<{
    status: 'approved' | 'pending' | 'rejected';
    reservationId?: string;
    message: string;
  }> {
    return this.http.get<any>(`${this.apiUrl}/payments/verify/${preferenceId}`);
  }
} 