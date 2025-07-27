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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
    }
  }, [message])

  return (
    <div className="px-6 pb-6">
      <div className="w-full max-w-4xl md:max-w-3xl min-w-[400px] mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: '#f3f4f6' }}>
            {/* Input Row */}
            <div className="mb-3">
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
                  text-base leading-6 min-h-[24px] max-h-[140px]
                  disabled:opacity-50
                "
                style={{ fontSize: '16px', lineHeight: '24px' }}
                rows={1}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              {/* DeepThink Button - Left */}
              <button
                type="button"
                onClick={handleDeepThink}
                className="
                  bg-blue-100 hover:bg-blue-200 text-blue-700 
                  px-3 py-2 rounded-lg transition-colors duration-200
                  flex items-center gap-2 text-sm font-medium
                  border border-blue-200 hover:border-blue-300
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
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.19 0 2.32.23 3.36.64"/>
                  <path d="M16 4l1.5 1.5L19 4"/>
                </svg>
                DeepThink (R1)
              </button>

              {/* Action Buttons - Right */}
              <div className="flex items-center gap-2">
                {/* Attach File Button */}
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
          </div>

          {/* AI Generated Notice */}
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
