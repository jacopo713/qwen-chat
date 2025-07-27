import React, { useState, useRef, useCallback } from 'react'
import { validateFile, getFileIcon } from '@/lib/firebase'
import { useFileUpload } from '@/hooks/useFileUpload'
import { FilePreview, FileMetadata } from '@/types/file'

interface FileUploadProps {
  onFileUploaded: (file: FileMetadata) => void
  onError?: (error: string) => void
  multiple?: boolean
  className?: string
}

export default function FileUpload({
  onFileUploaded,
  onError,
  multiple = false,
  className = ''
}: FileUploadProps) {
  const { uploadSingleFile, uploadStatus } = useFileUpload()
  const [isDragOver, setIsDragOver] = useState(false)
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createPreview = useCallback((file: File): FilePreview => {
    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file)
      : ''
    
    return {
      file,
      preview,
      id: crypto.randomUUID()
    }
  }, [])

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    // Create previews
    const newPreviews = fileArray.map(createPreview)
    setPreviews(newPreviews)

    // Upload files
    for (const preview of newPreviews) {
      const validation = validateFile(preview.file)
      
      if (!validation.isValid) {
        onError?.(validation.error || 'Invalid file')
        continue
      }

      try {
        const result = await uploadSingleFile(preview.file)
        
        if (result.success && result.file) {
          onFileUploaded(result.file)
        } else {
          onError?.(result.error || 'Upload failed')
        }
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Upload failed')
      }
    }

    // Clean up previews
    newPreviews.forEach(preview => {
      if (preview.preview) {
        URL.revokeObjectURL(preview.preview)
      }
    })
    setPreviews([])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [uploadSingleFile, onFileUploaded, onError, createPreview])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={`file-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.csv,.json"
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 min-h-[140px] flex flex-col items-center justify-center
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
          ${uploadStatus.isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {uploadStatus.isUploading ? (
          <div className="space-y-4 w-full">
            {/* Upload progress */}
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <div className="text-sm text-gray-600">
                Uploading... {Math.round(uploadStatus.progress)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadStatus.progress}%` }}
                ></div>
              </div>
            </div>

            {/* File previews during upload */}
            {previews.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {previews.map((preview) => (
                  <div key={preview.id} className="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm">
                    {preview.preview ? (
                      <img 
                        src={preview.preview} 
                        alt={preview.file.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                        <span className="text-xl">{getFileIcon(preview.file.type)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {preview.file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload icon */}
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            {/* Instructions */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                PNG, JPG, PDF, DOC up to 10MB
              </div>
            </div>

            {/* File types */}
            <div className="flex flex-wrap justify-center gap-1 text-xs text-gray-400">
              <span>🖼️ Images</span>
              <span>•</span>
              <span>📄 Documents</span>
              <span>•</span>
              <span>📊 Spreadsheets</span>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {uploadStatus.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700">{uploadStatus.error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
