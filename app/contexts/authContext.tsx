import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
	id: number;
	userName: string;
	fullName: string;
	email: string;
	phone: string;
	roleName: string;
	storeId: number;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (token: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const isAuthenticated = !!user;

	const login = async (token: string) => {
		try {
			const response = await fetch('http://localhost:8080/public/rest/v1/auth/me', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const userData = await response.json();
				setUser(userData);
			} else {
				logout();
			}
		} catch (error) {
			console.error('Failed to fetch user data:', error);
			logout();
		}
	};

	const logout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		setUser(null);
	};

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (token) {
			login(token).finally(() => setIsLoading(false));
		} else {
			setIsLoading(false);
		}
	}, []);

	const value = {
		user,
		isAuthenticated,
		isLoading,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
