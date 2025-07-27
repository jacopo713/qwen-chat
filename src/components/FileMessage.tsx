import React from 'react'
import { FileMessage as FileMessageType } from '@/types/file'
import FileDisplay from './FileDisplay'

interface FileMessageProps {
  message: FileMessageType
  isOwn?: boolean
  className?: string
}

export default function FileMessage({ 
  message, 
  isOwn = false, 
  className = '' 
}: FileMessageProps) {
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div 
      className={`
        file-message flex flex-col space-y-2 p-3 rounded-lg max-w-md
        ${isOwn 
          ? 'bg-blue-500 text-white ml-auto' 
          : 'bg-white border border-gray-200'
        }
        ${className}
      `}
    >
      {/* File content */}
      <div className={isOwn ? 'text-white' : 'text-gray-900'}>
        <FileDisplay 
          file={message.file} 
          className={isOwn ? '[&_*]:text-white' : ''}
        />
      </div>

      {/* Message text if any */}
      {message.content && message.content.trim() && (
        <div className={`text-sm ${isOwn ? 'text-blue-100' : 'text-gray-700'}`}>
          {message.content}
        </div>
      )}

      {/* Timestamp */}
      <div 
        className={`
          text-xs self-end
          ${isOwn ? 'text-blue-200' : 'text-gray-400'}
        `}
      >
        {formatTime(message.timestamp)}
      </div>
    </div>
  )
}
