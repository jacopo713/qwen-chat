import React from 'react'
import { MessageBubbleProps } from '@/types/chat'

export default function MessageBubble({ message, isLatest = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className="flex max-w-[85%] gap-3">
        {/* Avatar */}
        {isAssistant && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            Q
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col">
          <div
            className={`
              px-4 py-3 rounded-2xl relative shadow-sm
              ${isUser 
                ? 'bg-blue-600 text-white rounded-br-md' 
                : 'bg-white border border-gray-100 text-gray-900 rounded-bl-md'
              }
              ${message.isLoading ? 'animate-pulse' : ''}
            `}
          >
            {message.isLoading && !message.content ? (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            ) : (
              <div className="leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
                {message.isLoading && isLatest && (
                  <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
        )}
      </div>
    </div>
  )
}
