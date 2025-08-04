import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '~/contexts/authContext';

interface ProtectedRouteProps {
	children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, isLoading, navigate]);

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
