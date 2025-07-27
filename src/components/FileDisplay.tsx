import React, { useState } from 'react'
import { FileMetadata } from '@/types/file'
import { getFileIcon } from '@/lib/firebase'

interface FileDisplayProps {
  file: FileMetadata
  showDownload?: boolean
  className?: string
}

export default function FileDisplay({ 
  file, 
  showDownload = true, 
  className = '' 
}: FileDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const isImage = file.type.startsWith('image/')

  return (
    <div className={`file-display ${className}`}>
      {isImage && !imageError ? (
        <div className="relative">
          {/* Image preview */}
          <div className="relative max-w-sm rounded-lg overflow-hidden bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            <img
              src={file.url}
              alt={file.originalName}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`max-w-full h-auto max-h-64 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            {/* Image overlay with file info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <div className="text-sm font-medium truncate">{file.originalName}</div>
              <div className="text-xs opacity-75">{formatFileSize(file.size)}</div>
            </div>
          </div>

          {/* Download button for images */}
          {showDownload && imageLoaded && (
            <button
              onClick={handleDownload}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
              title="Download image"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        /* Non-image file display */
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border max-w-sm">
          <div className="text-2xl flex-shrink-0">
            {getFileIcon(file.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {file.originalName}
            </div>
            <div className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(file.uploadedAt).toLocaleDateString()}
            </div>
          </div>

          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Download file"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
