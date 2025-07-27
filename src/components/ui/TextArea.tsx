import React, { forwardRef, TextareaHTMLAttributes, useEffect, useRef, useImperativeHandle } from 'react'
import { cn } from '@/lib/utils'

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?: (value: string) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  maxRows?: number
  error?: string
  label?: string
  helperText?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    onChange,
    onKeyDown,
    rows = 1,
    maxRows = 4,
    error,
    label,
    helperText,
    disabled,
    ...props 
  }, ref) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    
    useImperativeHandle(ref, () => textAreaRef.current!)

    // Auto-resize functionality
    const adjustHeight = () => {
      const textArea = textAreaRef.current
      if (!textArea) return

      textArea.style.height = 'auto'
      
      const scrollHeight = textArea.scrollHeight
      const lineHeight = parseInt(getComputedStyle(textArea).lineHeight)
      const maxHeight = lineHeight * maxRows
      
      textArea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
      textArea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
    }

    useEffect(() => {
      adjustHeight()
    }, [props.value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
      adjustHeight()
    }

    const baseClasses = cn(
      'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
      'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400',
      'dark:focus:ring-blue-500',
      error && 'border-red-500 focus:ring-red-500',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <textarea
          ref={textAreaRef}
          className={baseClasses}
          rows={rows}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          {...props}
        />
        
        {(error || helperText) && (
          <p className={cn(
            'mt-1 text-sm',
            error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea
