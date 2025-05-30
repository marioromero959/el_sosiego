import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdditionalService, AdditionalServiceResponse } from '../models/additional-service.model';

@Injectable({
  providedIn: 'root'
})
export class AdditionalServiceService {
  private readonly endpoint = '/api/services';

  constructor(private apiService: ApiService) {}

  getAdditionalServices(): Observable<AdditionalService[]> {
    return this.apiService.get<AdditionalServiceResponse>(this.endpoint).pipe(
      map((response: AdditionalServiceResponse) => response.data.map(item => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        description: item.description,
        price: item.price
      })))
    );
  }
} 