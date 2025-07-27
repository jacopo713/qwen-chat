import React, { memo } from 'react'
import { ChatMessage } from '@/types'
import MessageItem from './MessageItem'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  loading?: boolean
  className?: string
}

const MessageList = memo(function MessageList({ 
  messages, 
  currentUserId, 
  loading = false,
  className = '' 
}: MessageListProps) {
  
  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner message="Caricamento messaggi..." />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="Nessun messaggio"
        description="Inizia una conversazione scrivendo il tuo primo messaggio"
        className={className}
      />
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message, index) => {
        const isOwn = message.userId === currentUserId
        const showAvatar = !isOwn && (
          index === 0 || 
          messages[index - 1]?.userId !== message.userId
        )
        const showTimestamp = index === messages.length - 1 || 
          messages[index + 1]?.userId !== message.userId

        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showTimestamp={showTimestamp}
          />
        )
      })}
      
      {loading && (
        <div className="flex justify-center py-2">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
    </div>
  )
})

export default MessageList
