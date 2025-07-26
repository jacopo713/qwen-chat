'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChatInputProps } from '@/types/chat'

export default function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  return (
    <div className="px-4 pb-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-3 rounded-2xl p-3 min-h-[72px]" style={{ backgroundColor: '#f3f4f6' }}>
          {/* Message Input */}
          <div className="flex-1 flex items-center">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="
                w-full bg-transparent border-none outline-none resize-none
                text-gray-900 placeholder-gray-500
                text-base leading-6 min-h-[24px] max-h-[120px]
                disabled:opacity-50
              "
              rows={1}
            />
          </div>

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
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
          <div className="text-xs text-gray-500">
            {message.length}/2000
          </div>
        </div>
      </form>
    </div>
  )
}
