import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { API_PUBLIC_URL } from 'config/env';
import {API_BASE_URL} from 'config/env';

export interface User {
  id: number;
  userId: number;
  roleId: number;
  storeId: number;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  roleName: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (
    username: string,
    password: string,
    storeId?: number,
  ) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //check for stored token on app load and validate it
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedRefreshToken = localStorage.getItem("auth_refresh_token");

      if (storedToken) {
        try {
          //validate token with backend
          const response = await fetch(`${API_BASE_URL}${API_PUBLIC_URL}/auth/validate`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            //token is valid, get user info
            const userResponse = await fetch(`${API_BASE_URL}${API_PUBLIC_URL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setToken(storedToken);
              setRefreshToken(storedRefreshToken);
              setUser(userData);
            } else {
              //user info fetch failed -> xoa tokens
              localStorage.removeItem("auth_token");
              localStorage.removeItem("auth_refresh_token");
            }
          } else {
            //token invalid -> thu refresh neu co refresh token
            if (storedRefreshToken) {
              const refreshSuccess = await refreshAccessToken();
              if (!refreshSuccess) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_refresh_token");
              }
            } else {
              localStorage.removeItem("auth_token");
            }
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_refresh_token");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    username: string,
    password: string,
    storeId?: number,
  ): Promise<boolean> => {
    try {
      console.log("Attempting login with:", { username, storeId });

      const loginData: any = { username, password };
      if (storeId) {
        loginData.storeId = storeId;
      }

      const response = await fetch(`${API_BASE_URL}${API_PUBLIC_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const tokenData = await response.json();

        //get user info neu successful login
        const userResponse = await fetch(`${API_BASE_URL}${API_PUBLIC_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${tokenData.accessToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();

          setToken(tokenData.accessToken);
          setRefreshToken(tokenData.refreshToken);
          setUser(userData);

          localStorage.setItem("auth_token", tokenData.accessToken);
          localStorage.setItem("auth_refresh_token", tokenData.refreshToken);

          console.log("Login successful");
          return true;
        }
      }

      console.log("Login failed");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem("auth_refresh_token");
    if (!storedRefreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_PUBLIC_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (response.ok) {
        const tokenData = await response.json();
        setToken(tokenData.accessToken);
        setRefreshToken(tokenData.refreshToken);
        localStorage.setItem("auth_token", tokenData.accessToken);
        localStorage.setItem("auth_refresh_token", tokenData.refreshToken);
        return true;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
    }

    return false;
  };

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem("auth_refresh_token");

    //logout on backend
    if (storedRefreshToken) {
      try {
        await fetch(`${API_BASE_URL}${API_PUBLIC_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    //xoa local state
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    login,
    logout,
    refreshAccessToken,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
