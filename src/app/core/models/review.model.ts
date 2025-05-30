export interface Review {
  id: number;
  documentId: string;
  name: string;
  text: string;
  rating: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
} 