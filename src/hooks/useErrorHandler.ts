import { useState, useCallback, useRef, useEffect } from 'react'
import { createErrorHandler, clearErrorAfterDelay } from '@/lib/utils'
import { UseErrorHandlerReturn } from '@/types'

interface UseErrorHandlerOptions {
  autoCleatDuration?: number
  persistError?: boolean
  onError?: (error: string) => void
  onClear?: () => void
}

export const useErrorHandler = (
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
  const {
    autoCleatDuration = 5000,
    persistError = false,
    onError,
    onClear
  } = options

  const [error, setErrorState] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Set error with automatic clearing
  const setError = useCallback((error: string | Error | null) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (error === null) {
      setErrorState(null)
      onClear?.()
      return
    }

    const errorMessage = error instanceof Error ? error.message : error
    setErrorState(errorMessage)
    onError?.(errorMessage)

    // Auto-clear error if not persisted
    if (!persistError && autoCleatDuration > 0) {
      timeoutRef.current = setTimeout(() => {
        setErrorState(null)
        onClear?.()
        timeoutRef.current = null
      }, autoCleatDuration)
    }
  }, [autoCleatDuration, persistError, onError, onClear])

  // Clear error manually
  const clearError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setErrorState(null)
    onClear?.()
  }, [onClear])

  // Handle error with the same functionality as setError but more semantic
  const handleError = useCallback((error: string | Error) => {
    setError(error)
  }, [setError])

  return {
    error,
    setError,
    clearError,
    handleError
  }
}

// Hook specializztto per errori di form
export const useFormErrorHandler = (fieldName?: string) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const setFieldError = useCallback((field: string, error: string | null) => {
    setFieldErrors(prev => {
      if (error === null) {
        const { [field]: removed, ...rest } = prev
        return rest
      }
      return { ...prev, [field]: error }
    })
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const { [field]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  const hasErrors = Object.keys(fieldErrors).length > 0
  const getFieldError = useCallback((field: string) => fieldErrors[field] || null, [fieldErrors])

  // Se è specificato un singolo campo, ritorna i metodi per quel campo
  if (fieldName) {
    return {
      error: fieldErrors[fieldName] || null,
      setError: (error: string | null) => setFieldError(fieldName, error),
      clearError: () => clearFieldError(fieldName),
      hasError: Boolean(fieldErrors[fieldName])
    }
  }

  // Altrimenti ritorna tutti i metodi per gestire errori multipli
  return {
    errors: fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    getFieldError
  }
}

// Hook per errori di rete/API con retry
export const useApiErrorHandler = () => {
  const { error, setError, clearError, handleError } = useErrorHandler({
    autoCleatDuration: 8000, // Errori API persistono un po' di più
    persistError: false
  })
  
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const handleApiError = useCallback((error: string | Error, retryFn?: () => Promise<void>) => {
    const errorMessage = error instanceof Error ? error.message : error
    
    // Personalizza messaggi di errore comuni
    let friendlyMessage = errorMessage
    
    if (errorMessage.includes('network')) {
      friendlyMessage = 'Errore di connessione. Verifica la tua connessione internet.'
    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      friendlyMessage = 'Sessione scaduta. Effettua nuovamente il login.'
    } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      friendlyMessage = 'Non hai i permessi per eseguire questa operazione.'
    } else if (errorMessage.includes('not-found') || errorMessage.includes('404')) {
      friendlyMessage = 'Risorsa non trovata.'
    } else if (errorMessage.includes('too-many-requests') || errorMessage.includes('429')) {
      friendlyMessage = 'Troppe richieste. Riprova tra qualche minuto.'
    } else if (errorMessage.includes('server') || errorMessage.includes('500')) {
      friendlyMessage = 'Errore del server. Riprova più tardi.'
    }
    
    setError(friendlyMessage)
    
    // Auto-retry per errori di rete
    if (retryFn && retryCount < 3 && errorMessage.includes('network')) {
      setTimeout(async () => {
        setIsRetrying(true)
        try {
          await retryFn()
          clearError()
          setRetryCount(0)
        } catch (retryError) {
          setRetryCount(prev => prev + 1)
        } finally {
          setIsRetrying(false)
        }
      }, 2000 * (retryCount + 1)) // Exponential backoff
    }
  }, [setError, clearError, retryCount])

  const resetRetry = useCallback(() => {
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  return {
    error,
    setError,
    clearError,
    handleError: handleApiError,
    isRetrying,
    retryCount,
    resetRetry
  }
}

// Hook per errori di upload file
export const useFileErrorHandler = () => {
  const { error, setError, clearError, handleError } = useErrorHandler({
    autoCleatDuration: 6000
  })

  const handleFileError = useCallback((error: string | Error, fileName?: string) => {
    const errorMessage = error instanceof Error ? error.message : error
    let friendlyMessage = errorMessage

    // Personalizza messaggi per errori di file comuni
    if (errorMessage.includes('size')) {
      friendlyMessage = fileName 
        ? `Il file "${fileName}" è troppo grande. Dimensione massima: 10MB.`
        : 'File troppo grande. Dimensione massima: 10MB.'
    } else if (errorMessage.includes('type') || errorMessage.includes('format')) {
      friendlyMessage = fileName
        ? `Il file "${fileName}" non è in un formato supportato.`
        : 'Formato file non supportato.'
    } else if (errorMessage.includes('upload')) {
      friendlyMessage = fileName
        ? `Errore nell'upload di "${fileName}". Riprova.`
        : 'Errore nell\'upload del file. Riprova.'
    } else if (errorMessage.includes('network')) {
      friendlyMessage = 'Errore di connessione durante l\'upload. Verifica la connessione.'
    }

    setError(friendlyMessage)
  }, [setError])

  return {
    error,
    setError,
    clearError,
    handleError: handleFileError
  }
}

// Hook per errori di validazione con messaggi personalizzati
export const useValidationErrorHandler = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const setValidationError = useCallback((field: string, errors: string[]) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: errors
    }))
  }, [])

  const clearValidationError = useCallback((field: string) => {
    setValidationErrors(prev => {
      const { [field]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllValidationErrors = useCallback(() => {
    setValidationErrors({})
  }, [])

  const hasValidationErrors = Object.keys(validationErrors).length > 0
  const getValidationErrors = useCallback((field: string) => validationErrors[field] || [], [validationErrors])
  const getFirstValidationError = useCallback((field: string) => {
    const errors = validationErrors[field]
    return errors && errors.length > 0 ? errors[0] : null
  }, [validationErrors])

  return {
    validationErrors,
    setValidationError,
    clearValidationError,
    clearAllValidationErrors,
    hasValidationErrors,
    getValidationErrors,
    getFirstValidationError
  }
}

export default useErrorHandler
