'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

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
            <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm">No chat sessions yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a new conversation to begin</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentSession?.id === session.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => switchToSession(session.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingTitleId === session.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveTitle(session.id)
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSaveTitle(session.id)
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelEdit()
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                          {session.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {getLastMessage(session)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatLastActivity(session.updatedAt)}
                        </p>
                      </>
                    )}
                  </div>

                  {editingTitleId !== session.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTitle(session.id, session.title)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit title"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(session.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete chat"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === session.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Chat</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Are you sure you want to delete this chat? This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(null)
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(session.id)
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getUserInitial()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
