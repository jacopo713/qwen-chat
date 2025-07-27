import React from 'react'
import { cn } from '@/lib/utils'
import Button from './Button'

interface ErrorBannerProps {
  error: string
  onClose?: () => void
  onRetry?: () => void
  variant?: 'error' | 'warning' | 'info'
  className?: string
  dismissible?: boolean
}

export default function ErrorBanner({
  error,
  onClose,
  onRetry,
  variant = 'error',
  className,
  dismissible = true
}: ErrorBannerProps) {
  const variants = {
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
  }

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div className={cn(
      'flex items-center justify-between p-4 border rounded-lg',
      variants[variant],
      className
    )}>
      <div className="flex items-center space-x-3">
        <span className="text-lg">{icons[variant]}</span>
        <p className="text-sm font-medium">{error}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-current hover:bg-black/10 dark:hover:bg-white/10"
          >
            Riprova
          </Button>
        )}
        
        {dismissible && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-current hover:bg-black/10 dark:hover:bg-white/10 p-1"
            aria-label="Chiudi"
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  )
}
