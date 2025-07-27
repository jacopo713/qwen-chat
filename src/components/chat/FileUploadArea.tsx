import React, { useRef, useState } from 'react'
import { cn, formatFileSize } from '@/lib/utils'
import { useDragAndDrop } from '@/hooks/useFileUpload'
import { FilePreview } from '@/types'
import Button from '../ui/Button'
import ErrorBanner from '../ui/ErrorBanner'

interface FileUploadAreaProps {
  onFilesSelected: (files: FileList | File[]) => void
  error?: string | null
  onErrorClear?: () => void
  disabled?: boolean
  previews?: FilePreview[]
  onRemoveFile?: (fileId: string) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  className?: string
}

export default function FileUploadArea({
  onFilesSelected,
  error,
  onErrorClear,
  disabled = false,
  previews = [],
  onRemoveFile,
  accept = 'image/*,application/pdf,.doc,.docx,.txt',
  multiple = false,
  maxSize = 10, // MB
  className
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { isDragOver, dragProps } = useDragAndDrop(
    onFilesSelected,
    { 
      accept: accept.split(',').map(type => type.trim()),
      multiple 
    }
  )

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const formatAcceptTypes = (accept: string): string => {
    const types = accept.split(',').map(type => type.trim())
    const friendlyTypes: string[] = []
    
    types.forEach(type => {
      if (type.includes('image')) friendlyTypes.push('Immagini')
      else if (type.includes('pdf')) friendlyTypes.push('PDF')
      else if (type.includes('doc')) friendlyTypes.push('Documenti Word')
      else if (type.includes('txt')) friendlyTypes.push('File di testo')
      else friendlyTypes.push(type)
    })
    
    return friendlyTypes.join(', ')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Error message */}
      {error && (
        <ErrorBanner 
          error={error} 
          onClose={onErrorClear}
          variant="error"
        />
      )}

      {/* Upload area */}
      <div
        {...dragProps}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600',
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
        )}
        onClick={disabled ? undefined : handleFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="sr-only"
        />

        <div className="space-y-2">
          {/* Upload icon */}
          <div className="text-4xl">
            {isDragOver ? '⬇️' : '📁'}
          </div>

          {/* Upload text */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isDragOver ? (
              <p className="font-medium text-blue-600 dark:text-blue-400">
                Rilascia i file qui
              </p>
            ) : (
              <div>
                <p className="font-medium">
                  Clicca per selezionare {multiple ? 'i file' : 'un file'} o trascinali qui
                </p>
                <p className="text-xs mt-1">
                  {formatAcceptTypes(accept)} • Massimo {maxSize}MB
                </p>
              </div>
            )}
          </div>

          {/* Upload button */}
          {!isDragOver && (
            <Button 
              variant="outline" 
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                handleFileSelect()
              }}
            >
              Sfoglia file
            </Button>
          )}
        </div>
      </div>

      {/* File previews */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            File selezionati ({previews.length})
          </h4>
          
          <div className="space-y-2">
            {previews.map((preview) => (
              <FilePreviewItem
                key={preview.id}
                preview={preview}
                onRemove={onRemoveFile}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente per l'anteprima dei file
function FilePreviewItem({ 
  preview, 
  onRemove, 
  disabled 
}: { 
  preview: FilePreview
  onRemove?: (fileId: string) => void
  disabled?: boolean 
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      {/* File preview/icon */}
      <div className="flex-shrink-0">
        {preview.category === 'image' && preview.preview && !imageError ? (
          <img
            src={preview.preview}
            alt={preview.file.name}
            className="w-10 h-10 object-cover rounded"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xl">
            {getFileIcon(preview.file)}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {preview.file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(preview.file.size)} • {preview.file.type}
        </p>
      </div>

      {/* Remove button */}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(preview.id)}
          disabled={disabled}
          className="flex-shrink-0 h-8 w-8 p-0 text-gray-500 hover:text-red-500"
          title="Rimuovi file"
        >
          ✕
        </Button>
      )}
    </div>
  )
}

function getFileIcon(file: File): string {
  const type = file.type.toLowerCase()
  
  if (type.includes('image')) return '🖼️'
  if (type.includes('video')) return '🎥'
  if (type.includes('audio')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('document') || type.includes('word')) return '📝'
  if (type.includes('sheet') || type.includes('excel')) return '📊'
  if (type.includes('archive') || type.includes('zip')) return '📦'
  
  return '📎'
}
