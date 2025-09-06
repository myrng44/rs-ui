import React from 'react';
import Dropdown from '../Dropdown';
import { Input } from '../Input';

interface FilterValues {
  paymentMethod: string;
  priceRange: { min: string; max: string };
  hasVoucher: string;
  storeId: string;
}

interface OrdersFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  paymentMethods: Array<{ id: string; name: string }>;
  stores: Array<{ id: number; name: string }>;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  filters,
  onFiltersChange,
  paymentMethods = [],
  stores = []
}) => {
  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: value
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      paymentMethod: '',
      priceRange: { min: '', max: '' },
      hasVoucher: '',
      storeId: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.paymentMethod || 
           filters.priceRange.min || 
           filters.priceRange.max || 
           filters.hasVoucher ||
           filters.storeId;
  };

  const paymentMethodOptions = [
    { label: 'Tất cả phương thức', value: '' },
    ...paymentMethods.map(pm => ({ 
      label: pm.name, 
      value: pm.name 
    }))
  ];

  const storeOptions = [
    { label: 'Tất cả cửa hàng', value: '' },
    ...stores.map(store => ({ 
      label: store.name, 
      value: store.id.toString() 
    }))
  ];

  const voucherOptions = [
    { label: 'Tất cả đơn hàng', value: '' },
    { label: 'Có voucher', value: 'yes' },
    { label: 'Không có voucher', value: 'no' }
  ];

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Bộ lọc tìm kiếm</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cửa hàng */}
        <Dropdown
          label="Cửa hàng"
          value={filters.storeId}
          onChange={(e) => handleFilterChange('storeId', e.target.value)}
          options={storeOptions}
          className="w-full"
        />

        {/* Phương thức thanh toán */}
        <Dropdown
          label="Phương thức thanh toán"
          value={filters.paymentMethod}
          onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
          options={paymentMethodOptions}
          className="w-full"
        />
        
        {/* Voucher */}
        <Dropdown
          label="Voucher"
          value={filters.hasVoucher}
          onChange={(e) => handleFilterChange('hasVoucher', e.target.value)}
          options={voucherOptions}
          className="w-full"
        />

        {/* Khoảng giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng giá (VNĐ)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Từ"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              min="0"
              step="10000"
            />
            <input
              type="number"
              placeholder="Đến"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              min="0"
              step="10000"
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Để trống để không giới hạn
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Bộ lọc đang áp dụng:</div>
          <div className="flex flex-wrap gap-2">
            {filters.storeId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Cửa hàng: {stores.find(s => s.id.toString() === filters.storeId)?.name || filters.storeId}
                <button
                  onClick={() => handleFilterChange('storeId', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.paymentMethod && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Thanh toán: {filters.paymentMethod}
                <button
                  onClick={() => handleFilterChange('paymentMethod', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.hasVoucher && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Voucher: {filters.hasVoucher === 'yes' ? 'Có' : 'Không có'}
                <button
                  onClick={() => handleFilterChange('hasVoucher', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.priceRange.min || filters.priceRange.max) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Giá: {filters.priceRange.min && `từ ${new Intl.NumberFormat('vi-VN').format(Number(filters.priceRange.min))}`}
                {filters.priceRange.min && filters.priceRange.max && ' - '}
                {filters.priceRange.max && `đến ${new Intl.NumberFormat('vi-VN').format(Number(filters.priceRange.max))}`}
                <button
                  onClick={() => handleFilterChange('priceRange', { min: '', max: '' })}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersFilters;