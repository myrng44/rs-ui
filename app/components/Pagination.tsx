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
 * Tạo mảng các trang để hiển thị xung quanh `centerPage`.
 * Khi slider thay đổi, ta dùng center = selectedPage để đảm bảo
 * các nút số luôn bao phủ trang đang được preview.
 */
function getVisiblePages(centerPage: number, totalPages: number, maxVisible = 7): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, centerPage - half);
  let end = start + maxVisible - 1;
  if (end > totalPages) {
    end = totalPages;
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
  // localSelected là trang đang được "preview" bởi slider (chưa commit)
  const [localSelected, setLocalSelected] = useState<number>(Math.max(1, currentPage));

  // Khi parent thay đổi currentPage (ví dụ refetch), đồng bộ lại preview
  useEffect(() => {
    setLocalSelected(Math.max(1, currentPage));
  }, [currentPage]);

  // tính hiển thị items
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  // Prev/Next commit ngay lập tức (dùng currentPage)
  const prev = () => {
    if (loading || currentPage <= 1) return;
    onPageChange(currentPage - 1);
  };
  const next = () => {
    if (loading || currentPage >= totalPages) return;
    onPageChange(currentPage + 1);
  };

  // khi slider thay đổi: chỉ cập nhật preview (localSelected)
  const onSliderChange = (v: number) => {
    setLocalSelected(v);
  };

  // Khi người click nút số: commit trang này
  const onNumberClick = (page: number) => {
    if (loading) return;
    // nếu user đã preview một trang khác (localSelected), họ có thể click số để commit that page.
    // commit the page that was clicked (not necessarily currentPage)
    onPageChange(page);
    // đồng bộ preview với trang thực
    setLocalSelected(page);
  };

  // Các nút hiển thị dựa trên preview (để khi kéo slider, danh sách số p sẽ bao phủ preview)
  const visiblePages = getVisiblePages(localSelected, totalPages, 7);

  return (
    <div className="flex flex-col gap-3 px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-700">
        <div>
          Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
          <span className="font-medium">{endItem}</span> trong tổng số{" "}
          <span className="font-medium">{totalItems}</span> kết quả
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prev}
            disabled={currentPage <= 1 || loading}
          >
            Trước
          </Button>

          {/* Số trang (khi click sẽ chuyển trang) */}
          {visiblePages.map((page) => {
            const isPreviewed = page === localSelected;
            const isCurrent = page === currentPage;
            // highlight previewed page (filled) so user sees which page will be committed if clicked
            const variant = isPreviewed ? "primary" : (isCurrent ? "primary" : "outline");
            const className = isPreviewed
              ? "bg-primary text-white"
              : (isCurrent ? "border-primary text-primary" : "");
            return (
              <Button
                key={page}
                variant={variant as any}
                size="sm"
                onClick={() => onNumberClick(page)}
                disabled={loading}
                className={className}
                aria-current={isCurrent ? "page" : undefined}
                title={isPreviewed ? `Đang chọn trang ${page} (bấm để đi)` : `Trang ${page}`}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={currentPage >= totalPages || loading}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Slider nằm dưới số */}
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-500 w-14 text-center">Trang</div>

        <div className="flex-1 px-2">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={localSelected}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            disabled={loading}
            className="w-full h-2 appearance-none bg-gray-200 rounded-lg accent-primary"
            aria-label="Chọn trang để preview"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>{totalPages}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded text-sm w-16 text-center">
            {localSelected}/{totalPages}
          </div>

          {/* "Đi" vẫn dùng: commit vào trang preview nếu khác current */}
          <input
            type="number"
            min={1}
            max={totalPages}
            value={localSelected}
            onChange={(e) => {
              const v = Number(e.target.value) || 1;
              const page = Math.max(1, Math.min(totalPages, Math.floor(v)));
              setLocalSelected(page);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && localSelected !== currentPage) onPageChange(localSelected);
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
            aria-label="Nhập trang để preview"
            disabled={loading}
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!loading && localSelected !== currentPage) {
                onPageChange(localSelected);
              }
            }}
            disabled={loading || localSelected === currentPage}
          >
            Đi
          </Button>
        </div>
      </div>
    </div>
  );
}
