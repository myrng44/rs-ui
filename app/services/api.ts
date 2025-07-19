import {
  TokenRequestDto,
  TokenResponseDto,
  TokenRefreshRequestDto,
  UserCreateDto,
  BaseUserDto,
  UserRoleDto,
  ProductGetDto,
  ProductCreateDto,
  ProductUpdateDto,
  CategoryDto,
  SupplierDto,
  StoreDto,
  StockDto,
  StoreStockDto,
  BatchDto,
  ImportLogDto,
  PagedResult
} from '../types/api';

const API_BASE_URL = 'http://localhost:8080';

//get otken from localStorage
const getAuthToken = (): string | null => {
  return localStore.getItem('access_token');
}
//create headers
const getAuthHeaders = (): HeaderInit => {

}