import React, { useState } from 'react'
import { ChatSession, UpdateChatSessionInput } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import Button from '../ui/Button'

interface ChatHeaderProps {
  session: ChatSession | null
  onSessionUpdate?: (updates: UpdateChatSessionInput) => void
  onDeleteSession?: () => void
  className?: string
}

export default function ChatHeader({
  session,
  onSessionUpdate,
  onDeleteSession,
  className
}: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(session?.title || '')
  const [showMenu, setShowMenu] = useState(false)

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== session?.title) {
      onSessionUpdate?.({ title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(session?.title || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  if (!session) {
    return (
      <div className={cn('flex items-center justify-between p-4', className)}>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          <span className="text-gray-500 dark:text-gray-400">Caricamento chat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between p-4 bg-white dark:bg-gray-800', className)}>
      {/* Left side - Title and status */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Status indicator */}
        <div className={cn(
          'w-3 h-3 rounded-full flex-shrink-0',
          session.isActive ? 'bg-green-400' : 'bg-gray-400'
        )} />

        {/* Title */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveTitle}
              className="w-full px-2 py-1 text-lg font-semibold bg-gray-100 dark:bg-gray-700 rounded border-none outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsEditing(true)}
              title="Clicca per modificare"
            >
              {session.title}
            </h1>
          )}
          
          {/* Session info */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{session.messageCount} messaggi</span>
            <span>Aggiornata: {formatDateTime(session.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2 relative">
        {/* Save/Cancel buttons when editing */}
        {isEditing && (
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveTitle}
              className="h-8 w-8 p-0"
              title="Salva"
            >
              ✓
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-8 w-8 p-0"
              title="Annulla"
            >
              ✕
            </Button>
          </div>
        )}

        {/* Menu button */}
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0"
            title="Menu sessione"
          >
            ⋮
          </Button>
        )}

        {/* Dropdown menu */}
        {showMenu && !isEditing && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => {
                  setIsEditing(true)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✏️ Rinomina sessione
              </button>
              
              <button
                onClick={() => {
                  onSessionUpdate?.({ isActive: !session.isActive })
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {session.isActive ? '⏸️ Pausa sessione' : '▶️ Riattiva sessione'}
              </button>
              
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              
              <button
                onClick={() => {
                  if (window.confirm('Sei sicuro di voler eliminare questa sessione? Questa azione non può essere annullata.')) {
                    onDeleteSession?.()
                  }
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                🗑️ Elimina sessione
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}
