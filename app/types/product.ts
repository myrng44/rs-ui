export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: number;
  supplierId: number;
}

export interface ProductListResponse {
  totalElements: number;
  elements: Product[];
}

export interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  unitPrice: string;
  categoryId: string;
  supplierId: string;
}
