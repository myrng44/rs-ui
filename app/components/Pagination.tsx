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
  const [localSelected, setLocalSelected] = useState<number>(() =>
    Math.max(1, Math.min(totalPages || 1, currentPage || 1))
  );

  // input state for jump box (string so user can type)
  const [pageInput, setPageInput] = useState<string>(String(currentPage));

  useEffect(() => {
    const clamped = Math.max(1, Math.min(totalPages || 1, currentPage || 1));
    setLocalSelected(clamped);
    setPageInput(String(clamped));
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const goTo = (page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, Math.floor(page)));
    if (loading || clamped === currentPage) return;
    setLocalSelected(clamped);
    setPageInput(String(clamped));
    onPageChange(clamped);
  };

  const prev = () => {
    if (loading || currentPage <= 1) return;
    goTo(currentPage - 1);
  };
  const next = () => {
    if (loading || currentPage >= totalPages) return;
    goTo(currentPage + 1);
  };

  // center pages around the real current page for stable appearance
  const visiblePages = getVisiblePages(currentPage, totalPages, 7);

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
            aria-label="Trang trước"
            title="Trang trước"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 6 L9 12 L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>

          {/* Container cho nút số — whitespace-nowrap để tránh bị wrap/che */}
          <div className="flex items-center gap-1 whitespace-nowrap">
            {visiblePages.map((page) => {
              const isCurrent = page === currentPage;
              // primary for current, outline for others
              const variant = isCurrent ? "primary" : "outline";
              // make buttons a consistent min width so current page isn't hidden
              const className = isCurrent
                ? "border-primary text-primary min-w-[36px] flex items-center justify-center"
                : "min-w-[36px] flex items-center justify-center";
              return (
                <Button
                  key={page}
                  variant={variant as any}
                  size="sm"
                  onClick={() => goTo(page)}
                  disabled={loading || page === currentPage}
                  className={className}
                  aria-current={isCurrent ? "page" : undefined}
                  title={`Trang ${page}`}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={next}
            disabled={currentPage >= totalPages || loading}
            aria-label="Trang sau"
            title="Trang sau"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6 L15 12 L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>

          {/* Jump box: input + button */}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => {
                // allow empty or partial input; sanitize to digits only
                const raw = e.target.value;
                // allow '' so user can edit
                if (raw === "") {
                  setPageInput("");
                  return;
                }
                // only accept digits and clamp later on submit
                const onlyDigits = raw.replace(/[^\d]/g, "");
                setPageInput(onlyDigits);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = Number(pageInput) || currentPage;
                  goTo(v);
                }
              }}
              disabled={loading}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none"
              aria-label="Nhập trang để tới"
              title={`Nhập trang từ 1 tới ${totalPages}`}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const v = Number(pageInput) || currentPage;
                goTo(v);
              }}
              disabled={loading || String(currentPage) === String(pageInput) || pageInput === ""}
            >
              Đến
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>
          Trang <span className="font-medium">{currentPage}</span> /{" "}
          <span className="font-medium">{totalPages}</span>
        </div>

        <div>
          <span className="text-xs text-gray-400">
            {itemsPerPage} kết quả / trang
          </span>
        </div>
      </div>
    </div>
  );
}
