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
          <div className="flex flex-col items-center space-y-3">
            {/* Upload progress */}
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-sm font-medium text-blue-600">
              Uploading... {Math.round(uploadStatus.progress)}%
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadStatus.progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            {/* Upload icon */}
            <div className="w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {/* Upload text */}
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Support for images, documents, and text files up to 10MB
              </p>
            </div>

            {/* Supported formats */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
              <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
              <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
              <span className="px-2 py-1 bg-gray-100 rounded">DOC</span>
              <span className="px-2 py-1 bg-gray-100 rounded">TXT</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview area */}
      {previews.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Files to upload:</h4>
          <div className="grid gap-2">
            {previews.map((preview) => (
              <div
                key={preview.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* File icon or image preview */}
                <div className="w-10 h-10 flex-shrink-0">
                  {preview.preview ? (
                    <img
                      src={preview.preview}
                      alt={preview.file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-lg">
                      {getFileIcon(preview.file.type)}
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {/* Status */}
                <div className="text-xs text-blue-600">
                  Ready
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {uploadStatus.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadStatus.error}</p>
        </div>
      )}
    </div>
  )
}
