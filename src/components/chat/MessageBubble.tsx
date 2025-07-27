import React from 'react'
import { MessageBubbleProps } from '@/types/chat'

export default function MessageBubble({ message, isLatest = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'ml-12' : 'mr-12'}`}>
        {/* Message Content */}
        <div
          className={`
            ${isUser 
              ? 'bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-sm' 
              : 'text-gray-900 py-2'
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
        <div className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
}
