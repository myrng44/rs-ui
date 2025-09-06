import { Input } from '../Input';
import Dropdown from '../Dropdown';

interface CategorySearchProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
}

export function CategorySearch({
  searchText,
  onSearchChange,
  sortValue,
  onSortChange,
}: CategorySearchProps) {
  const sortOptions = [
    { value: '-createdTime', label: 'Mới nhất' }, // Set default as first option
    { value: 'createdTime', label: 'Cũ nhất' },
    { value: 'name', label: 'Tên A-Z' },
    { value: '-name', label: 'Tên Z-A' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        {/* <Input
          placeholder="Tìm kiếm danh mục..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        /> */}
      </div>
      <div className="sm:w-64">
        <Dropdown
          label="Sắp xếp theo"
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          options={sortOptions}
        />
      </div>
    </div>
  );
}