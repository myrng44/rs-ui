export interface APIResponseHeader {
  timestamp: string;
  code: number;
  message: string;
  traceId: string;
}

export interface APIListResponseHeader extends APIResponseHeader {
  offset: number;
  limit: number;
  totalRecords: number;
}

export interface APIResponse<T> {
  header: APIResponseHeader;
  body: T;
}

export interface APIListResponse<T> {
  header: APIListResponseHeader;
  body: T[];
}

export interface APIError extends Error {
  status?: number;
  code?: number;
  traceId?: string;
}
