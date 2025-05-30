import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StrapiResponse<T> {
  data: T | T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<StrapiResponse<T>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (typeof params[key] === 'object') {
            httpParams = httpParams.set(key, JSON.stringify(params[key]));
          } else {
            httpParams = httpParams.set(key, params[key]);
          }
        }
      });
    }

    return this.http.get<StrapiResponse<T>>(`${this.apiUrl}/${endpoint}`, { params: httpParams });
  }

  getById<T>(endpoint: string, id: number): Observable<StrapiResponse<T>> {
    return this.http.get<StrapiResponse<T>>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  post<T>(endpoint: string, data: any): Observable<StrapiResponse<T>> {
    return this.http.post<StrapiResponse<T>>(`${this.apiUrl}/${endpoint}`, { data });
  }

  put<T>(endpoint: string, id: number, data: any): Observable<StrapiResponse<T>> {
    return this.http.put<StrapiResponse<T>>(`${this.apiUrl}/${endpoint}/${id}`, { data });
  }

  delete(endpoint: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${endpoint}/${id}`);
  }

  // Método auxiliar para construir URLs de imágenes de Strapi
  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.strapiUrl}${path}`;
  }
} 