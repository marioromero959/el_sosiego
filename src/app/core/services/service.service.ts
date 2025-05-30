import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService, StrapiResponse } from './api.service';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor(private apiService: ApiService) {}

  getServices(): Observable<Service[]> {
    return this.apiService.get<Service[]>('services', {
      params: {
        'filters[isActive][$eq]': true,
        sort: 'order:asc'
      }
    }).pipe(
      map((response: StrapiResponse<Service[]>) => response.data as Service[])
    );
  }

  getServiceById(id: number): Observable<Service> {
    return this.apiService.getById<Service>('services', id).pipe(
      map((response: StrapiResponse<Service>) => response.data as Service)
    );
  }
} 