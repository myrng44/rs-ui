import { Button } from "./Button";
import { useState, useEffect } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

/**
 * Trả về mảng các trang hiển thị dựa trên currentPage, tổng số trang và số trang tối đa hiển thị.
 */
function getVisiblePages(currentPage: number, totalPages: number, maxVisible = 5): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false
}: PaginationProps) {
  const [inputPage, setInputPage] = useState(currentPage);

  // Khi chuyển trang, cập nhật lại inputPage cho đúng
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // Tính toán số item đầu và cuối
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Nếu chỉ có 1 trang, không hiển thị pagination
  if (totalPages <= 1) return null;

  // Xử lý nhập trang: luôn nằm trong [1, totalPages]
  const handleInputChange = (value: number) => {
    const page = Math.max(1, Math.min(totalPages, value));
    setInputPage(page);
  };

  // Xử lý chuyển trang qua input
  const goToInputPage = () => {
    if (
      inputPage >= 1 &&
      inputPage <= totalPages &&
      inputPage !== currentPage
    ) {
      onPageChange(inputPage);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
          <span className="font-medium">{endItem}</span> trong tổng số{" "}
          <span className="font-medium">{totalItems}</span> kết quả
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Nút trước */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          Trước
        </Button>

        {/* Danh sách số trang */}
        {getVisiblePages(currentPage, totalPages).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={page === currentPage ? "bg-primary text-white" : ""}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        ))}

        {/* Nút sau */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          Sau
        </Button>

        {/* Nhập trang */}
        <div className="flex items-center space-x-1 ml-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={(e) => handleInputChange(Number(e.target.value))}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={goToInputPage}
            disabled={loading || inputPage === currentPage}
          >
            Đi
          </Button>
        </div>
      </div>
    </div>
  );
}