import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface ExchangeRate {
  usd: number;
  ars: number;
  date: string;
  source: string;
}

export interface PriceInfo {
  amountUSD: number;
  amountARS: number;
  exchangeRate: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currentRate$ = new BehaviorSubject<ExchangeRate | null>(null);
  private lastFetchTime: number = 0;
  private cacheDuration: number = 3600000; // 1 hora en milisegundos

  constructor(private http: HttpClient) {
    this.loadExchangeRate();
  }

  /**
   * Obtiene la tasa de cambio oficial USD/ARS
   * Usa API de DolarAPI.com (gratuita y sin autenticación)
   */
  private loadExchangeRate(): void {
    const now = Date.now();
    
    // Si tenemos datos recientes, no volver a buscar
    if (this.currentRate$.value && (now - this.lastFetchTime) < this.cacheDuration) {
      return;
    }

    // API de DolarAPI - Dólar Oficial
    this.http.get<any>('https://dolarapi.com/v1/dolares/oficial')
      .pipe(
        map(response => ({
          usd: 1,
          ars: response.venta, // Precio de venta del dólar oficial
          date: response.fechaActualizacion,
          source: 'DolarAPI - Oficial'
        })),
        catchError(error => {
          console.warn('Error fetching exchange rate from DolarAPI, using fallback', error);
          // Tasa de fallback (actualiza manualmente si es necesario)
          return of({
            usd: 1,
            ars: 1050, // Tasa de fallback aproximada
            date: new Date().toISOString(),
            source: 'Fallback Rate'
          });
        }),
        tap(rate => {
          this.currentRate$.next(rate);
          this.lastFetchTime = Date.now();
          console.log('💱 Exchange rate updated:', rate);
        })
      )
      .subscribe();
  }

  /**
   * Obtiene la tasa de cambio actual como Observable
   */
  getExchangeRate(): Observable<ExchangeRate> {
    this.loadExchangeRate();
    
    return this.currentRate$.asObservable().pipe(
      map(rate => {
        if (!rate) {
          // Si no hay tasa disponible, retornar fallback
          return {
            usd: 1,
            ars: 1050,
            date: new Date().toISOString(),
            source: 'Default Fallback'
          };
        }
        return rate;
      })
    );
  }

  /**
   * Obtiene la tasa de cambio actual de forma síncrona
   */
  getCurrentRate(): number {
    const rate = this.currentRate$.value;
    return rate ? rate.ars : 1050; // Fallback si no hay tasa
  }

  /**
   * Convierte USD a ARS
   */
  convertUSDtoARS(amountUSD: number): Observable<PriceInfo> {
    return this.getExchangeRate().pipe(
      map(rate => ({
        amountUSD,
        amountARS: Math.round(amountUSD * rate.ars),
        exchangeRate: rate.ars,
        lastUpdated: rate.date
      }))
    );
  }

  /**
   * Convierte ARS a USD
   */
  convertARStoUSD(amountARS: number): Observable<PriceInfo> {
    return this.getExchangeRate().pipe(
      map(rate => ({
        amountUSD: Math.round((amountARS / rate.ars) * 100) / 100,
        amountARS,
        exchangeRate: rate.ars,
        lastUpdated: rate.date
      }))
    );
  }

  /**
   * Obtiene información de precios (USD y ARS) de forma síncrona
   */
  getPriceInfo(amountUSD: number): PriceInfo {
    const rate = this.getCurrentRate();
    return {
      amountUSD,
      amountARS: Math.round(amountUSD * rate),
      exchangeRate: rate,
      lastUpdated: this.currentRate$.value?.date || new Date().toISOString()
    };
  }

  /**
   * Forzar actualización de la tasa de cambio
   */
  refreshExchangeRate(): Observable<ExchangeRate> {
    this.lastFetchTime = 0; // Resetear cache
    this.loadExchangeRate();
    return this.getExchangeRate();
  }
}
