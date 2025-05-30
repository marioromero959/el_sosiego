export interface Room {
  id: number;
  documentId: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  size: number;
  beds: string;
  amenities: string[];
  available: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  images: Array<{
    id: number;
    documentId: string;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: any;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }> | null;
} 