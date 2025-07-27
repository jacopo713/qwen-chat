'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChatInputProps } from '@/types/chat'
import { useFileUpload } from '@/hooks/useFileUpload'
import { FileMetadata } from '@/types/file'
import FileUpload from '@/components/FileUpload'

export default function ChatInput({
  onSendMessage,
  onDeepThink,
  onAttachFile,
  isLoading = false,
  placeholder = "Ask me anything about coding..."
}: ChatInputProps & { onFileUploaded?: (file: FileMetadata) => void }) {
  const [message, setMessage] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle file upload
  const handleFileUploaded = (file: FileMetadata) => {
    // Send file message
    onSendMessage(`📎 File: ${file.originalName}`)
    setShowFileUpload(false)
  }

  const handleFileError = (error: string) => {
    console.error('File upload error:', error)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  return (
    <div className="bg-white border-t border-gray-200">
      {/* File Upload Area */}
      {showFileUpload && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Carica File</h4>
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onError={handleFileError}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="
                w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
                disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-900 placeholder-gray-500
              "
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* DeepThink Button */}
            {onDeepThink && (
              <button
                type="button"
                onClick={onDeepThink}
                disabled={isLoading}
                className="
                  flex-shrink-0 w-10 h-10 text-purple-600 hover:text-purple-700 hover:bg-purple-50
                  rounded-lg transition-colors duration-200
                  flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                title="DeepThink (R1)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                </svg>
              </button>
            )}

            {/* File Attachment Button */}
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              disabled={isLoading}
              className={`
                flex-shrink-0 w-10 h-10 transition-colors duration-200
                rounded-lg flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                ${showFileUpload 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
              title="Carica file"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="
                flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
                text-white rounded-xl transition-colors duration-200
                flex items-center justify-center
                disabled:cursor-not-allowed
              "
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4z"/>
                  <path d="M22 2 11 13"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
