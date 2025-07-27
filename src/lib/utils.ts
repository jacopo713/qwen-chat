import { Timestamp } from 'firebase/firestore'

// Simple class name merger utility (without external dependencies)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Error handling utilities
export const createErrorHandler = (
  setError: (error: string | null) => void,
  duration = 5000
) => {
  return (error: string | Error) => {
    const errorMessage = error instanceof Error ? error.message : error
    setError(errorMessage)
    
    if (duration > 0) {
      setTimeout(() => setError(null), duration)
    }
  }
}

export const clearErrorAfterDelay = (
  setError: (error: string | null) => void,
  delay = 5000
) => {
  setTimeout(() => setError(null), delay)
}

// Date and timestamp utilities
export const timestampToDate = (timestamp: Timestamp | null | undefined): Date => {
  if (!timestamp || timestamp === null) {
    return new Date()
  }
  
  if (typeof timestamp.toDate !== 'function') {
    return new Date()
  }
  
  return timestamp.toDate()
}

export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date)
}

export const formatTimestamp = (timestamp: Date): string => {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(timestamp)
}

// File validation utilities
export const validateFileSize = (file: File, maxSizeMB = 10): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024
  return file.size <= maxSize
}

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// File icon utilities
export const getFileIcon = (filename: string): string => {
  const extension = getFileExtension(filename)
  
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📝',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
    svg: '🖼️',
    mp4: '🎥',
    mov: '🎥',
    avi: '🎥',
    mp3: '🎵',
    wav: '🎵',
    zip: '📦',
    rar: '📦',
    excel: '📊',
    xlsx: '📊',
    xls: '📊'
  }
  
  return iconMap[extension] || '📎'
}

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const generateId = (): string => {
  return crypto.randomUUID()
}

// Validation utilities
export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validateFile = (file: File): ValidationResult => {
  const allowedTypes = [
    'image/*',
    'application/pdf',
    'text/*',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  if (!validateFileType(file, allowedTypes)) {
    return {
      isValid: false,
      error: 'Tipo di file non supportato'
    }
  }
  
  if (!validateFileSize(file, 10)) {
    return {
      isValid: false,
      error: 'File troppo grande (max 10MB)'
    }
  }
  
  return { isValid: true }
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Local storage utilities with error handling
export const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}

// Array utilities
export const groupBy = <T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((result, item) => {
    const key = getKey(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as Record<K, T[]>)
}

// Object utilities
export const pick = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const omit = <T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

// Simple className utility for conditional classes
export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Color utility functions
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - returns black or white
  // This is a simplified version without external dependencies
  return backgroundColor.includes('dark') || backgroundColor.includes('gray-8') 
    ? 'text-white' 
    : 'text-gray-900'
}

// Format utilities
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }
  
  return new Intl.DateTimeFormat('it-IT', { ...defaultOptions, ...options }).format(date)
}

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// URL utilities
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.split('/').pop() || 'file'
  } catch {
    return 'file'
  }
}

// Number utilities
export const formatNumber = (num: number, locale = 'it-IT'): string => {
  return new Intl.NumberFormat(locale).format(num)
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

// Promise utilities
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const withTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number,
  timeoutError = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    )
  ])
}
