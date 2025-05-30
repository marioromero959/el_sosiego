import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Zone, ZoneResponse } from '../models/zone.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private readonly endpoint = '/api/zones';

  constructor(private apiService: ApiService) {}

  getZones(): Observable<Zone[]> {
    const params = {
      'populate': '*'
    };

    return this.apiService.get<ZoneResponse>(this.endpoint, params).pipe(
      map((response: ZoneResponse) => {
        console.log('API Response:', response); // Para debugging
        return response.data.map(item => ({
          id: item.id,
          documentId: item.documentId,
          name: item.name,
          description: item.description,
          images: item.images?.map(img => `${environment.strapiUrl}${img.url}`) || [],
          items: {
            Items: item.items?.Items || []
          }
        }));
      })
    );
  }
} 