import { useState, useCallback, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, fileService } from '@/lib/firebase'
import { useFileErrorHandler } from './useErrorHandler'
import { validateFile, generateId } from '@/lib/utils'
import {
  FileMetadata,
  FileUploadResult,
  FileUploadState,
  UseFileUploadReturn,
  FilePreview,
  UploadStatus
} from '@/types'

interface UseFileUploadOptions {
  multiple?: boolean
  maxFiles?: number
  autoUpload?: boolean
  onUploadStart?: (file: File) => void
  onUploadProgress?: (file: File, progress: number) => void
  onUploadComplete?: (file: FileMetadata) => void
  onUploadError?: (file: File, error: string) => void
  onAllUploadsComplete?: (files: FileMetadata[]) => void
}

interface UseFileUploadExtendedReturn extends UseFileUploadReturn {
  uploadProgress: Record<string, number>
  previews: FilePreview[]
  addFiles: (files: FileList | File[]) => void
  removeFile: (fileId: string) => void
  clearFiles: () => void
  cancelUpload: (fileId?: string) => void
  retryUpload: (fileId: string) => Promise<void>
}

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadExtendedReturn => {
  const {
    multiple = false,
    maxFiles = 5,
    autoUpload = false,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    onAllUploadsComplete
  } = options

  const [user] = useAuthState(auth)
  const { error, handleError, clearError } = useFileErrorHandler()
  
  const [uploadStatus, setUploadStatus] = useState<FileUploadState>({
    status: 'idle',
    progress: 0,
    error: null
  })
  
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [completedUploads, setCompletedUploads] = useState<FileMetadata[]>([])
  
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  // Create file preview
  const createPreview = useCallback((file: File): FilePreview => {
    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file)
      : ''
    
    return {
      id: generateId(),
      file,
      preview,
      category: getFileCategory(file)
    }
  }, [])

  // Get file category helper
  const getFileCategory = useCallback((file: File) => {
    const type = file.type.toLowerCase()
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.startsWith('audio/')) return 'audio'
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document'
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'archive'
    return 'other'
  }, [])

  // Add files to preview queue
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validate file count
    if (!multiple && fileArray.length > 1) {
      handleError('Seleziona solo un file')
      return
    }
    
    if (previews.length + fileArray.length > maxFiles) {
      handleError(`Massimo ${maxFiles} file consentiti`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (!validation.isValid) {
        handleError(validation.error || 'File non valido', file.name)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Create previews
    const newPreviews = validFiles.map(createPreview)
    
    setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews)
    clearError()

    // Auto upload if enabled
    if (autoUpload && user) {
      newPreviews.forEach(preview => {
        uploadSingleFile(preview.file)
      })
    }
  }, [multiple, maxFiles, previews.length, validateFile, createPreview, handleError, clearError, autoUpload, user])

  // Remove file from preview
  const removeFile = useCallback((fileId: string) => {
    setPreviews(prev => prev.filter(p => p.id !== fileId))
    
    // Cancel upload if in progress
    const controller = abortControllersRef.current.get(fileId)
    if (controller) {
      controller.abort()
      abortControllersRef.current.delete(fileId)
    }
    
    // Remove progress tracking
    setUploadProgress(prev => {
      const { [fileId]: removed, ...rest } = prev
      return rest
    })

    // Clean up preview URL
    const preview = previews.find(p => p.id === fileId)
    if (preview?.preview) {
      URL.revokeObjectURL(preview.preview)
    }
  }, [previews])

  // Clear all files
  const clearFiles = useCallback(() => {
    // Cancel all uploads
    abortControllersRef.current.forEach(controller => {
      controller.abort()
    })
    abortControllersRef.current.clear()

    // Clean up preview URLs
    previews.forEach(preview => {
      if (preview.preview) {
        URL.revokeObjectURL(preview.preview)
      }
    })

    setPreviews([])
    setUploadProgress({})
    setCompletedUploads([])
    setUploadStatus({ status: 'idle', progress: 0, error: null })
    clearError()
  }, [previews, clearError])

  // Cancel specific upload
  const cancelUpload = useCallback((fileId?: string) => {
    if (fileId) {
      const controller = abortControllersRef.current.get(fileId)
      if (controller) {
        controller.abort()
        abortControllersRef.current.delete(fileId)
      }
      
      setUploadProgress(prev => {
        const { [fileId]: removed, ...rest } = prev
        return rest
      })
    } else {
      // Cancel all uploads
      abortControllersRef.current.forEach(controller => {
        controller.abort()
      })
      abortControllersRef.current.clear()
      setUploadProgress({})
    }
  }, [])

  // Upload single file
  const uploadSingleFile = useCallback(async (file: File): Promise<FileUploadResult> => {
    if (!user) {
      const error = 'Utente non autenticato'
      handleError(error, file.name)
      return { success: false, error }
    }

    const fileId = generateId()
    const controller = new AbortController()
    abortControllersRef.current.set(fileId, controller)

    try {
      setUploadStatus({ status: 'uploading', progress: 0, error: null })
      onUploadStart?.(file)

      const result = await fileService.uploadFileWithProgress(
        file,
        user.uid,
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
          setUploadStatus(prev => ({ ...prev, progress }))
          onUploadProgress?.(file, progress)
        }
      )

      abortControllersRef.current.delete(fileId)

      if (result.success && result.file) {
        setUploadStatus({ status: 'success', progress: 100, error: null })
        setCompletedUploads(prev => [...prev, result.file!])
        onUploadComplete?.(result.file)
        clearError()
        
        return result
      } else {
        const errorMsg = result.error || 'Upload fallito'
        setUploadStatus({ status: 'error', progress: 0, error: errorMsg })
        handleError(errorMsg, file.name)
        onUploadError?.(file, errorMsg)
        
        return result
      }
    } catch (error) {
      abortControllersRef.current.delete(fileId)
      
      const errorMsg = error instanceof Error ? error.message : 'Errore nell\'upload'
      setUploadStatus({ status: 'error', progress: 0, error: errorMsg })
      handleError(errorMsg, file.name)
      onUploadError?.(file, errorMsg)
      
      return { success: false, error: errorMsg }
    }
  }, [user, handleError, clearError, onUploadStart, onUploadProgress, onUploadComplete, onUploadError])

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<FileUploadResult[]> => {
    if (!user) {
      const error = 'Utente non autenticato'
      handleError(error)
      return files.map(() => ({ success: false, error }))
    }

    const results: FileUploadResult[] = []
    
    for (const file of files) {
      const result = await uploadSingleFile(file)
      results.push(result)
    }

    // Check if all uploads completed successfully
    const successfulUploads = results.filter(r => r.success && r.file).map(r => r.file!)
    if (successfulUploads.length > 0) {
      onAllUploadsComplete?.(successfulUploads)
    }

    return results
  }, [user, uploadSingleFile, handleError, onAllUploadsComplete])

  // Retry failed upload
  const retryUpload = useCallback(async (fileId: string): Promise<void> => {
    const preview = previews.find(p => p.id === fileId)
    if (!preview) {
      handleError('File non trovato per il retry')
      return
    }

    await uploadSingleFile(preview.file)
  }, [previews, uploadSingleFile, handleError])

  // Reset upload state
  const resetUpload = useCallback(() => {
    setUploadStatus({ status: 'idle', progress: 0, error: null })
    setUploadProgress({})
    setCompletedUploads([])
    clearError()
  }, [clearError])

  // Cleanup on unmount
  useCallback(() => {
    return () => {
      // Cancel all uploads
      abortControllersRef.current.forEach(controller => {
        controller.abort()
      })
      
      // Clean up preview URLs
      previews.forEach(preview => {
        if (preview.preview) {
          URL.revokeObjectURL(preview.preview)
        }
      })
    }
  }, [previews])

  return {
    // Original interface
    uploadSingleFile,
    uploadMultipleFiles,
    uploadStatus,
    resetUpload,
    
    // Extended interface
    uploadProgress,
    previews,
    addFiles,
    removeFile,
    clearFiles,
    cancelUpload,
    retryUpload,
    
    // Error handling
    error,
    clearError
  }
}

// Hook semplificato per upload singolo
export const useSimpleFileUpload = () => {
  const [user] = useAuthState(auth)
  const { error, handleError, clearError } = useFileErrorHandler()
  const [uploading, setUploading] = useState(false)

  const uploadFile = useCallback(async (file: File): Promise<FileMetadata | null> => {
    if (!user) {
      handleError('Utente non autenticato')
      return null
    }

    const validation = validateFile(file)
    if (!validation.isValid) {
      handleError(validation.error || 'File non valido', file.name)
      return null
    }

    setUploading(true)
    try {
      const result = await fileService.uploadFile(file, user.uid)
      
      if (result.success && result.file) {
        clearError()
        return result.file
      } else {
        handleError(result.error || 'Upload fallito', file.name)
        return null
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Errore nell\'upload', file.name)
      return null
    } finally {
      setUploading(false)
    }
  }, [user, handleError, clearError])

  return {
    uploadFile,
    uploading,
    error,
    clearError
  }
}

// Hook per drag and drop
export const useDragAndDrop = (
  onFilesDropped: (files: FileList) => void,
  options: { accept?: string[]; multiple?: boolean } = {}
) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const { error, handleError, clearError } = useFileErrorHandler()

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) {
      handleError('Nessun file selezionato')
      return
    }

    if (!options.multiple && files.length > 1) {
      handleError('Seleziona solo un file')
      return
    }

    // Validate file types if specified
    if (options.accept && options.accept.length > 0) {
      const validFiles = Array.from(files).filter(file => {
        return options.accept!.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type
        })
      })

      if (validFiles.length === 0) {
        handleError('Tipo di file non supportato')
        return
      }
    }

    clearError()
    onFilesDropped(files)
  }, [options.accept, options.multiple, onFilesDropped, handleError, clearError])

  const dragProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop
  }

  return {
    isDragOver,
    dragProps,
    error,
    clearError
  }
}

export default useFileUpload
