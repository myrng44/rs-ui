import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  readOnly?: boolean; 
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      readOnly,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full flex flex-col gap-1 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          readOnly={readOnly}
          aria-invalid={!!error}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm
            focus:outline-none focus:ring-2
            ${error ? 'border-error focus:ring-error' : 'border-gray-300 focus:ring-primary'}
            ${readOnly ? 'bg-gray-100 text-gray-700 cursor-default' : ''}
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition
          `}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";