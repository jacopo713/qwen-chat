'use client'

import React, { useEffect, useRef } from 'react'
import { ChatSession } from '@/types/chat'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface ChatAreaProps {
  session: ChatSession | null
  isLoading: boolean
  error?: string | null
  onClearError?: () => void
}

export default function ChatArea({ session, isLoading, error, onClearError }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages, isLoading])

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-gray-400"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No chat selected
          </h3>
          <p className="text-gray-500">
            Select a conversation from the sidebar or start a new chat
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-100 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {session.title}
          </h2>
          <p className="text-sm text-gray-500">
            {session.messages.length} messages • Last active {session.updatedAt.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
            {onClearError && (
              <button
                onClick={onClearError}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto p-4">
          {session.messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">👋</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start the conversation
              </h3>
              <p className="text-gray-500">
                Send a message to begin chatting with Qwen AI
              </p>
            </div>
          ) : (
            <>
              {session.messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLatest={index === session.messages.length - 1}
                />
              ))}
              
              {/* Typing Indicator - show only when loading and no partial content */}
              <TypingIndicator isVisible={isLoading && !session.messages[session.messages.length - 1]?.content} />
            </>
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}
