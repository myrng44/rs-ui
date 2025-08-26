import React from 'react';
import { Button } from './Button';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface TableAction<T = any> {
  label: string;
  variant?: 'outline' | 'danger' | 'primary';
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string;
  keyField?: keyof T;
}

export function DataTable<T extends Record<string, any>>({
                                                           data,
                                                           columns,
                                                           actions = [],
                                                           loading = false,
                                                           emptyMessage = 'Không có dữ liệu',
                                                           keyField = 'id' as keyof T,
                                                         }: DataTableProps<T>) {
  const getNestedValue = (obj: T, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return (
    <div className='bg-surface rounded-lg shadow-md border border-gray-200'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
          <tr className='border-b border-gray-200'>
            {columns.map((column) => (
              <th
                key={column.key}
                className='text-left p-4 font-semibold text-gray-900'
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className='text-left p-4 font-semibold text-gray-900'>Thao tác</th>
            )}
          </tr>
          </thead>
          <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className='text-center p-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                <p className='mt-2 text-gray-600'>Đang tải...</p>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                className='text-center p-8 text-gray-600'
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={String(item[keyField])} className='border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150'>
                {columns.map((column) => {
                  const value = getNestedValue(item, column.key);
                  return (
                    <td key={column.key} className='p-4'>
                      {column.render ? column.render(value, item) : value}
                    </td>
                  );
                })}
                {actions.length > 0 && (
                  <td className='p-4'>
                    <div className='flex space-x-2'>
                      {actions.map((action, index) => (
                        <Button
                          key={index}
                          size='sm'
                          variant={action.variant || 'outline'}
                          onClick={() => action.onClick(item)}
                          disabled={action.disabled ? action.disabled(item) : false}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
