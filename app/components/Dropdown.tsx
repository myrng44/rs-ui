import type { ChangeEvent } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: DropdownOption[];
  required?: boolean;
  readonly?: boolean; 
  className?: string;
  error?: string;
  helperText?: string;
}

export default function Dropdown({
  label,
  value,
  onChange,
  options,
  required = false,
  readonly = false,
  className = "",
  error,
  helperText,
}: DropdownProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`
          w-full p-2 border rounded-md focus:outline-none focus:ring-2
          ${error ? "border-error focus:ring-error" : "border-gray-300 focus:ring-primary"}
          ${readonly ? "bg-gray-100 text-gray-700 cursor-default" : ""}
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition
        `}
        value={value}
        onChange={onChange}
        disabled={readonly}
        aria-invalid={!!error}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
}