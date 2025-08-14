export interface Product {
  id: string
  sku: string
  name: string
  unitPrice: string
  description: string
  categoryId: string
  supplierId: string
}

export interface ProductResponseTpye {
  totalElements: number
  elements: Product[]
}

export interface ProductShow {
  id: string
  sku: string
  name: string
  unitPrice: string
  description: string
  categoryId: string
  supplierId: string
}

export interface ParamFetch {
  path: string
  offset: number
  limit: number
}
