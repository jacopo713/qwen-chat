import React, { useState } from 'react'
import { ChatMessage, isTextMessage, isFileMessage, isSystemMessage } from '@/types'
import { cn, formatTime, truncateText } from '@/lib/utils'
import { useMessageActions } from '@/hooks/useMessages'
import Button from '../ui/Button'

interface MessageItemProps {
  message: ChatMessage
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  className?: string
}

export default function MessageItem({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  className
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)
  const { copyMessage, shareMessage, downloadMessage } = useMessageActions()

  const handleCopy = () => {
    copyMessage(message.content)
    setShowActions(false)
  }

  const handleShare = () => {
    shareMessage(message.content)
    setShowActions(false)
  }

  const handleDownload = () => {
    const filename = isFileMessage(message) 
      ? `${message.file.name}_message.txt`
      : `message_${formatTime(message.timestamp)}.txt`
    downloadMessage(message.content, filename)
    setShowActions(false)
  }

  // System message rendering
  if (isSystemMessage(message)) {
    return (
      <div className={cn('flex justify-center my-4', className)}>
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {message.content}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex',
      isOwn ? 'justify-end' : 'justify-start',
      className
    )}>
      <div className={cn(
        'flex max-w-md group',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
          </div>
        )}

        {/* Message content */}
        <div className={cn(
          'relative',
          isOwn && showAvatar && 'ml-3'
        )}>
          {/* Message bubble */}
          <div
            className={cn(
              'px-4 py-2 rounded-lg relative',
              isOwn 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
              'hover:shadow-md transition-shadow cursor-pointer'
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            {/* File message */}
            {isFileMessage(message) && (
              <div className="mb-2">
                <FileMessageContent file={message.file} />
              </div>
            )}

            {/* Text content */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Actions menu */}
            {showActions && (
              <div className={cn(
                'absolute top-0 flex items-center space-x-1 z-10',
                isOwn ? 'right-full mr-2' : 'left-full ml-2'
              )}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Copia messaggio"
                >
                  📋
                </Button>
                
                {navigator.share && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleShare}
                    className="h-6 w-6 p-0 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Condividi messaggio"
                  >
                    📤
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDownload}
                  className="h-6 w-6 p-0 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Scarica messaggio"
                >
                  💾
                </Button>
              </div>
            )}
          </div>

          {/* Timestamp */}
          {showTimestamp && (
            <div className={cn(
              'mt-1 text-xs text-gray-500 dark:text-gray-400',
              isOwn ? 'text-right' : 'text-left'
            )}>
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente per visualizzare i file nei messaggi
function FileMessageContent({ file }: { file: any }) {
  const [imageError, setImageError] = useState(false)

  const handleDownload = () => {
    if (file.downloadUrl || file.url) {
      window.open(file.downloadUrl || file.url, '_blank')
    }
  }

  return (
    <div className="bg-black/10 dark:bg-white/10 rounded-lg p-3 border border-black/20 dark:border-white/20">
      <div className="flex items-center space-x-3">
        {/* File preview */}
        <div className="flex-shrink-0">
          {file.category === 'image' && !imageError ? (
            <img
              src={file.thumbnailUrl || file.url}
              alt={file.name}
              className="w-12 h-12 object-cover rounded"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-2xl">
              {getFileIcon(file)}
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs opacity-75">
            {formatFileSize(file.size)} • {file.type}
          </p>
        </div>

        {/* Download button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDownload}
          className="flex-shrink-0 h-8 w-8 p-0 text-current hover:bg-black/10 dark:hover:bg-white/10"
          title="Scarica file"
        >
          ⬇️
        </Button>
      </div>
    </div>
  )
}

// Helper function per le icone dei file (dovrebbe essere importata da utils)
function getFileIcon(file: any): string {
  const type = file.type?.toLowerCase() || ''
  
  if (type.includes('image')) return '🖼️'
  if (type.includes('video')) return '🎥'
  if (type.includes('audio')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('document') || type.includes('word')) return '📝'
  if (type.includes('sheet') || type.includes('excel')) return '📊'
  if (type.includes('archive') || type.includes('zip')) return '📦'
  
  return '📎'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
