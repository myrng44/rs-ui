import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  size? :'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  centered?: boolean;
}

export default function Container({
  children,
  size = 'lg',
  className = '',
  centered = true,
                                  }: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  };

  const centerClasses = centered ? 'mx-auto' : '';

  return (
    <div className={`${sizeClasses[size]} ${centerClasses} ${className}`}>
      {children}
    </div>
  );
}