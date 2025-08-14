import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='fixed inset-0 backdrop-blur-sm bg-black/10 transition-opacity' onClick={onClose} />
        <div className='relative bg-surface rounded-lg shadow-xl w-full max-w-lg transform transition-all'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
              <span className='sr-only'>Đóng</span>
              <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          <div className='p-6'>{children}</div>

          {footer && <div className='flex justify-end space-x-3 p-6 border-t border-gray-200'>{footer}</div>}
        </div>
      </div>
    </div>
  )
}
