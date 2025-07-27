'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChatInputProps } from '@/types/chat'

export default function ChatInput({
  onSendMessage,
  onDeepThink,
  onAttachFile,
  isLoading = false,
  placeholder = "Ask me anything about coding..."
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    <div className="px-4 pb-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
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

          {/* File Attachment Button - SOLO HANDLER AGGIUNTO */}
          <button
            type="button"
            onClick={onAttachFile || (() => alert('File upload feature coming soon!'))}
            disabled={isLoading}
            className="
              flex-shrink-0 w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100
              rounded-lg transition-colors duration-200
              flex items-center justify-center
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            title="Attach file"
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
  )
}
