import {useEffect} from "react";

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export function Toast({message, type = 'info', duration = 3000, onClose, className=''}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-gray-600',
  }[type];

  return (
    <div className={`fixed top-5 right-5 z-[9999] px-6 py-3 text-white rounded-lg shadow-lg ${bgColor} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-300">×</button>
      </div>
    </div>
  );
}