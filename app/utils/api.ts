import { API_PUBLIC_URL } from "config/env";
import { API_SECURED_URL } from "config/env";
import { API_BASE_URL } from "config/env";

class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;

  private constructor() {
    this.baseURL = API_BASE_URL;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("auth_refresh_token");
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}${API_PUBLIC_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const tokenData = await response.json();
        localStorage.setItem("auth_token", tokenData.accessToken);
        localStorage.setItem("auth_refresh_token", tokenData.refreshToken);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    //if request failed -> xoa token
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    return false;
  }

  public async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${API_SECURED_URL}${endpoint}`;

    //prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    //tao request
    let response = await fetch(url, {
      ...options,
      headers,
    });

    //if get a 401 and have a refresh token -> try to refresh and retry
    if (response.status === 401 && token && this.getRefreshToken()) {
      const refreshSuccess = await this.refreshToken();
      if (refreshSuccess) {
        //thu request lai voi new token
        const newToken = this.getAuthToken();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      } else {
        //loi khi refresh -> quay lai login page
        window.location.href = "/login";
      }
    }

    return response;
  }

  public async get(endpoint: string): Promise<Response> {
    return this.request(endpoint, { method: "GET" });
  }

  public async post(endpoint: string, data?: any): Promise<Response> {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put(endpoint: string, data?: any): Promise<Response> {
    return this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete(endpoint: string): Promise<Response> {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export const apiClient = ApiClient.getInstance();
export default apiClient;
