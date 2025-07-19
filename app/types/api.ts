export interface PagedResult<T> {
  elements: T[];
  totalElements: number;
}

//auth
export interface TokenRequestDto {
  username: string;
  password: string;
  storeId?: number;
  ipAddress?: string;
  deviceSession?: string;
  traceId?: string;
}

export interface TokenResponseDto {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  issuedAt: number;
  expiresIn: number;
  expiresAt: number;
}

export interface TokenRefreshRequestDto {
  refreshToken: string;
  ipAddress?: string;
  deviceSession?: string;
}

export interface UserCreateDto {
  id?: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  storeId?: number;
  password: string;
}

export interface BaseUserDto {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  storeId?: number;
}

export interface UserRoleDto {
  id: number;
  userId: number;
  roleId: number;
  storeId?: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  permissions: string[];
}

//product & store
export interface ProductGetDto {
  id: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: number;
  supplierId: number;
}

export interface ProductCreateDto {
  id?: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: number;
  supplierId: number;
}

export interface ProductUpdateDto {
  id: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  categoryId: number;
  supplierId: number;
  enabled: boolean;
}

export interface CategoryDto {
  id?: number;
  name: string;
  description: string;
}

export interface SupplierDto {
  id?: number;
  name: string;
  address: string;
  contact: string;
}

export interface StoreDto {
  id?: number;
  name: string;
  address: string;
  phone: string;
  enabled: boolean;
}

export interface StockDto {
  id?: number;
  name: string;
  location: string;
  enabled: boolean;
}

export interface StoreStockDto {
  id?: number;
  productId: number;
  storeId: number;
  quantity: number;
  importLogId: string;
}

export interface BatchDto {
  id?: number;
  importLogId: number;
  productId: number;
  initialQuantity: number;
  currentQuantity: number;
  importPrice: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
}

export interface ImportLogDto {
  id?: string;
  fromStock: number;
  toStore: number;
  startDate: string;
  deliveryDate: string;
  status: string;
}