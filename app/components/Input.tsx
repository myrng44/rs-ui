import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	required?: boolean;
	readonly?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, required, readonly, className = '', ...props }, ref) => {
		return (
			<div className='w-full'>
				{label && (
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						{label}
						{required && <span className='text-red-500 ml-1'>*</span>}
					</label>
				)}
				<input
					ref={ref}
					readOnly={readonly}
					className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:shadow-md
            hover:border-gray-400 hover:shadow-md
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${readonly ? 'bg-gray-100 text-gray-700 cursor-default' : ''}
            ${error ? 'border-error focus:ring-error' : ''}
            ${className}
          `}
					{...props}
				/>
				{error && <p className='mt-1 text-sm text-error'>{error}</p>}
			</div>
		);
	},
);

Input.displayName = 'Input';
