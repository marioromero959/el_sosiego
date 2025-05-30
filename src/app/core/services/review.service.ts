import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService, StrapiResponse } from './api.service';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private apiService: ApiService) {}

  getReviews(): Observable<Review[]> {
    return this.apiService.get<Review[]>('reviews').pipe(
      map((response: StrapiResponse<Review[]>) => response.data as Review[])
    );
  }

  getVerifiedReviews(): Observable<Review[]> {
    return this.apiService.get<Review[]>('reviews', { 
      params: { 
        'filters[isVerified][$eq]': true,
        sort: 'createdAt:desc'
      } 
    }).pipe(
      map((response: StrapiResponse<Review[]>) => response.data as Review[])
    );
  }

  createReview(review: Omit<Review, 'id' | 'documentId' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Observable<Review> {
    return this.apiService.post<Review>('reviews', review).pipe(
      map((response: StrapiResponse<Review>) => response.data as Review)
    );
  }
} 