import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({className = '', error, ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors';
    const errorClasses = error ? 'border-red-300 bg-red-50' : 'border-gray-300';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
    );
  }
)

Input.displayName = 'Input';
export default Input;