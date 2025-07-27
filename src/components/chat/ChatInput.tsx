'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChatInputProps } from '@/types/chat'

export default function ChatInput({ 
  onSendMessage, 
  onDeepThink, 
  onAttachFile, 
  isLoading = false, 
  placeholder = "Type your message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return
    
    onSendMessage(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleDeepThink = () => {
    if (onDeepThink) {
      onDeepThink()
    }
  }

  const handleAttachFile = () => {
    if (onAttachFile) {
      onAttachFile()
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
    <div className="w-full">
      <div className="max-w-4xl md:max-w-3xl min-w-[400px] mx-auto px-6">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main Input Container */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm focus-within:border-blue-300 focus-within:shadow-md transition-all duration-200">
            {/* Textarea and Action Buttons */}
            <div className="flex items-end gap-3 p-4">
              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className="
                  flex-1 resize-none bg-transparent text-gray-900 placeholder-gray-500
                  focus:outline-none focus:ring-0 border-0 p-0
                  min-h-[40px] max-h-[120px] leading-6
                "
                rows={1}
              />

              {/* Action Buttons - Right */}
              <div className="flex items-center gap-2">
                {/* Attach File Button */}
                {onAttachFile && (
                  <button
                    type="button"
                    onClick={handleAttachFile}
                    className="
                      flex-shrink-0 w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100
                      rounded-lg transition-colors duration-200
                      flex items-center justify-center
                    "
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
                )}

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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg 
                      width="18" 
                      height="18" 
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
            </div>

            {/* DeepThink Button */}
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={handleDeepThink}
                className="
                  flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 
                  hover:bg-blue-100 rounded-lg transition-colors duration-200
                "
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                </svg>
                DeepThink (R1)
              </button>
            </div>
          </div>

          {/* AI Generated Notice - MINIMAL SPACING */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-400">
              AI-generated, for reference only
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
