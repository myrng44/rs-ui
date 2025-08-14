import { Button } from '@/components/button'
import { useState } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  const [inputPage, setInputPage] = useState(currentPage)

  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className='flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-md'>
      <div className='flex items-center text-sm text-gray-700'>
        <span>
          Hiển thị <span className='font-medium'>{startItem}</span> đến <span className='font-medium'>{endItem}</span>{' '}
          trong tổng số <span className='font-medium'>{totalItems}</span> kết quả
        </span>
      </div>

      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          Trước
        </Button>

        {getVisiblePages().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'outline'}
            size='sm'
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={page === currentPage ? 'bg-primary text-white' : ''}
          >
            {page}
          </Button>
        ))}

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          Sau
        </Button>

        {/* Enter page number */}
        <div className='flex items-center space-x-1 ml-2'>
          <input
            type='number'
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(Number(e.target.value))}
            className='w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none'
          />
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              if (inputPage >= 1 && inputPage <= totalPages && inputPage !== currentPage) {
                onPageChange(inputPage)
              }
            }}
            disabled={loading || inputPage === currentPage}
          >
            Đi
          </Button>
        </div>
      </div>
    </div>
  )
}
