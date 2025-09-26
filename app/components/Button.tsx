import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({ variant = 'primary', size = 'md', children, className = '', icon, iconPosition = 'left', ...props }: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';

  const variantClasses = {
    primary: 'bg-primary text-on-primary hover:bg-opacity-90 hover:shadow-lg focus:ring-primary',
    secondary: 'bg-secondary text-on-secondary hover:bg-opacity-90 hover:shadow-lg focus:ring-secondary',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:ring-primary',
    danger: 'bg-error text-white hover:bg-opacity-90 hover:shadow-lg focus:ring-error',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {icon && iconPosition === 'left' && <span className='mr-2 inline-flex'>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className='ml-2 inline-flex'>{icon}</span>}
    </button>
  );
}