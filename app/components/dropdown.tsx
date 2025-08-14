import type { ChangeEvent } from 'react'

interface DropdownOption {
  label: string
  value: string
}

interface DropdownProps {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  options: DropdownOption[]
  required?: boolean
}

export default function Dropdown({ label, value, onChange, options, required = false }: DropdownProps) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      <select
        className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
