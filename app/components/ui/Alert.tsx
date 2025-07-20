import type { ReactNode } from "react";

interface AlertProps {
  variant?: 'error' | 'info' | 'success' | 'warning';
  children: ReactNode;
  className?: string;
}

export default function Alert({
  variant = 'error',
  children,
  className = '',
                              }: AlertProps) {
  const variantClasses = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-700",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const iconColors = {
    error: "text-red-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }

  return (
    <div
      className={`border rounded-lg p-3 ${variantClasses[variant]} ${className}`}
    >
      <div className="flex items-center">
        <svg
          className={`h-4 w-4 mr-2 ${iconColors[variant]}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {variant === "error" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
          {variant === "success" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
          {variant === "warning" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          )}
          {variant === "info" && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        <span className="text-sm">{children}</span>
      </div>
    </div>
  );
}