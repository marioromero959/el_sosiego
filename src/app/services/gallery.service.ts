import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Gallery, GalleryResponse } from '../models/gallery.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private readonly endpoint = '/api/galleries';

  constructor(private apiService: ApiService) {}

  getGalleries(): Observable<Gallery[]> {
    const params = {
      'populate': '*'
    };

    return this.apiService.get<GalleryResponse>(this.endpoint, params).pipe(
      map((response: GalleryResponse) => {
        console.log('API Response:', response); // Para debugging
        return response.data.map(item => ({
          id: item.id,
          documentId: item.documentId,
          name: item.name,
          description: item.description,
          category: item.category || 'all',
          images: item.images?.map(img => `${environment.strapiUrl}${img.url}`) || []
        }));
      })
    );
  }
} 