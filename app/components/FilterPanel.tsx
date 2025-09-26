import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'search';
  options?: FilterOption[];
  value?: any;
  placeholder?: string;
  min?: number;
  max?: number;
}

interface FilterPanelProps {
  filters: FilterGroup[];
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeFiltersCount?: number;
}

export function FilterPanel({
                              filters,
                              onFilterChange,
                              onApplyFilters,
                              onClearFilters,
                              isOpen,
                              onClose,
                              activeFiltersCount = 0,
                            }: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='fixed inset-0 bg-black bg-opacity-25 transition-opacity' onClick={onClose} />

        <div className='relative bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <h3 className='text-lg font-semibold text-gray-900'>Bộ lọc nâng cao</h3>
              {activeFiltersCount > 0 && (
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-on-primary'>
                  {activeFiltersCount} bộ lọc
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200'
            >
              <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filters.map((filter) => (
                <div key={filter.key} className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    {filter.label}
                  </label>

                  {filter.type === 'search' && (
                    <Input
                      value={filter.value || ''}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                    />
                  )}

                  {filter.type === 'select' && (
                    <select
                      value={filter.value || ''}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    >
                      <option value=''>Tất cả</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} {option.count && `(${option.count})`}
                        </option>
                      ))}
                    </select>
                  )}

                  {filter.type === 'multiselect' && (
                    <div className='space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3'>
                      {filter.options?.map((option) => (
                        <label key={option.value} className='flex items-center space-x-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={(filter.value || []).includes(option.value)}
                            onChange={(e) => {
                              const currentValues = filter.value || [];
                              const newValues = e.target.checked
                                ? [...currentValues, option.value]
                                : currentValues.filter((v: string) => v !== option.value);
                              onFilterChange(filter.key, newValues);
                            }}
                            className='rounded border-gray-300 text-primary focus:ring-primary'
                          />
                          <span className='text-sm text-gray-700'>
                            {option.label} {option.count && `(${option.count})`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {filter.type === 'range' && (
                    <div className='grid grid-cols-2 gap-2'>
                      <Input
                        type='number'
                        placeholder='Tối thiểu'
                        value={filter.value?.min || ''}
                        onChange={(e) => onFilterChange(filter.key, { ...filter.value, min: e.target.value })}
                        min={filter.min}
                        max={filter.max}
                      />
                      <Input
                        type='number'
                        placeholder='Tối đa'
                        value={filter.value?.max || ''}
                        onChange={(e) => onFilterChange(filter.key, { ...filter.value, max: e.target.value })}
                        min={filter.min}
                        max={filter.max}
                      />
                    </div>
                  )}

                  {filter.type === 'date' && (
                    <div className='grid grid-cols-2 gap-2'>
                      <Input
                        type='date'
                        value={filter.value?.from || ''}
                        onChange={(e) => onFilterChange(filter.key, { ...filter.value, from: e.target.value })}
                      />
                      <Input
                        type='date'
                        value={filter.value?.to || ''}
                        onChange={(e) => onFilterChange(filter.key, { ...filter.value, to: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50'>
            <Button variant='outline' onClick={onClearFilters}>
              Xóa tất cả
            </Button>
            <div className='flex items-center gap-3'>
              <Button variant='outline' onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={onApplyFilters} className='btn-gradient'>
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}