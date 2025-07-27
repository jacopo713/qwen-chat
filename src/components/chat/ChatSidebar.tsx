'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { formatDistanceToNow } from 'date-fns'

export default function ChatSidebar() {
  const { user, logout } = useAuth()
  const {
    sessions,
    currentSession,
    switchToSession,
    createNewSession,
    deleteSession,
    updateSessionTitle,
    isLoading
  } = useChat()

  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getUserInitial = () => {
    if (!user?.email) return '?'
    return user.email.charAt(0).toUpperCase()
  }

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) {
      const emailParts = user.email.split('@')
      return emailParts[0]
    }
    return 'User'
  }

  const getLastMessage = (session: any) => {
    if (!session.messages || session.messages.length === 0) {
      return 'No messages yet'
    }
    const lastMessage = session.messages[session.messages.length - 1]
    const content = lastMessage.content || 'Empty message'
    return content.length > 50 ? content.substring(0, 50) + '...' : content
  }

  const handleNewChat = async () => {
    try {
      await createNewSession()
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const handleEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingTitleId(sessionId)
    setEditingTitle(currentTitle)
  }

  const handleSaveTitle = async (sessionId: string) => {
    if (!editingTitle.trim()) return

    try {
      await updateSessionTitle(sessionId, editingTitle.trim())
      setEditingTitleId(null)
      setEditingTitle('')
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingTitleId(null)
    setEditingTitle('')
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const formatLastActivity = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  if (!user) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm">Sign in to access your chat history</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <button
            onClick={handleNewChat}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="New Chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading chats...
          </div>
        )}
      </div>

      {/* Chat Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No chat sessions yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group relative mb-2 p-3 rounded-lg border cursor-pointer transition-all duration-200
                  ${currentSession?.id === session.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                  }
                `}
                onClick={() => switchToSession(session.id)}
              >
                {/* Session Title */}
                <div className="flex items-start justify-between mb-2">
                  {editingTitleId === session.id ? (
                    <div className="flex-1 mr-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle(session.id)
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        onBlur={() => handleSaveTitle(session.id)}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <h3 className={`
                      text-sm font-medium truncate flex-1 mr-2
                      ${currentSession?.id === session.id ? 'text-blue-900' : 'text-gray-900'}
                    `}>
                      {session.title}
                    </h3>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTitle(session.id, session.title)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Edit title"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(session.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete chat"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Last Message Preview */}
                <p className={`
                  text-xs mb-2 line-clamp-2
                  ${currentSession?.id === session.id ? 'text-blue-700' : 'text-gray-500'}
                `}>
                  {getLastMessage(session)}
                </p>

                {/* Timestamp and Message Count */}
                <div className="flex items-center justify-between">
                  <span className={`
                    text-xs
                    ${currentSession?.id === session.id ? 'text-blue-600' : 'text-gray-400'}
                  `}>
                    {formatLastActivity(session.updatedAt)}
                  </span>
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${currentSession?.id === session.id 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === session.id && (
                  <div className="absolute inset-0 bg-white border border-red-200 rounded-lg p-3 z-10">
                    <p className="text-sm text-gray-900 mb-3">Delete this chat?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSession(session.id)
                        }}
                        className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(null)
                        }}
                        className="flex-1 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getUserInitial()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
