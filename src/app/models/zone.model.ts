export interface ZoneResponse {
  data: {
    id: number;
    documentId: string;
    name: string;
    description: string;
    images: Array<{
      id: number;
      documentId: string;
      name: string;
      alternativeText: string | null;
      caption: string | null;
      width: number;
      height: number;
      formats: {
        thumbnail: ImageFormat;
        small: ImageFormat;
        medium: ImageFormat;
        large: ImageFormat;
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
    }>;
    items: {
      Items: string[];
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

export interface Zone {
  id: number;
  documentId: string;
  name: string;
  description: string;
  images: string[];
  items: {
    Items: string[];
  };
} 