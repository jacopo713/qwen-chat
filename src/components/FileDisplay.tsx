import React, { useState } from 'react'
import { FileMetadata } from '@/types/file'
import { getFileIcon } from '@/lib/firebase'

interface FileDisplayProps {
  file: FileMetadata
  className?: string
  showDownload?: boolean
  showPreview?: boolean
  compact?: boolean
}

export default function FileDisplay({ 
  file, 
  className = '',
  showDownload = true,
  showPreview = true,
  compact = false
}: FileDisplayProps) {
  const [imageError, setImageError] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImage = file.type.startsWith('image/')
  const isPDF = file.type === 'application/pdf'
  const isDocument = file.type.includes('word') || file.type === 'text/plain'

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

  const handlePreview = () => {
    if (isImage || isPDF) {
      setIsPreviewOpen(true)
    } else {
      // For non-previewable files, just download
      handleDownload()
    }
  }

  if (compact) {
    return (
      <div className={`file-display-compact flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-sm">{getFileIcon(file.type)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </div>
        </div>
        {showDownload && (
          <button
            onClick={handleDownload}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`file-display bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          {/* File icon/preview */}
          <div className="flex-shrink-0">
            {isImage && !imageError ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onError={() => setImageError(true)}
                onClick={showPreview ? handlePreview : undefined}
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-xl">{getFileIcon(file.type)}</span>
              </div>
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatFileSize(file.size)} • {file.type}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Uploaded {new Intl.DateTimeFormat('it-IT', {
                dateStyle: 'short',
                timeStyle: 'short'
              }).format(file.uploadedAt)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex space-x-2">
            {showPreview && (isImage || isPDF) && (
              <button
                onClick={handlePreview}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Preview"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            
            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-auto">
              {isImage ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : isPDF ? (
                <iframe
                  src={file.url}
                  className="w-full h-96"
                  title={file.name}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">{getFileIcon(file.type)}</div>
                  <p className="text-gray-500">Preview not available for this file type</p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Download to view
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
