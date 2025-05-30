export interface AdditionalServiceResponse {
  data: {
    id: number;
    documentId: string;
    name: string;
    description: string;
    price: number;
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

export interface AdditionalService {
  id: number;
  documentId: string;
  name: string;
  description: string;
  price: number;
} 