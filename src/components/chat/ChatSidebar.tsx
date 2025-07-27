'use client'

import React, { useState, useEffect } from 'react'
import { ChatSession } from '@/types/chat'
import { useAuth } from '@/context/AuthContext'

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
}

export default function ChatSidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat 
}: ChatSidebarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatDate = (date: Date) => {
    if (!isMounted) return '00:00' // Placeholder during hydration
    
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getLastMessage = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1]
    if (!lastMessage) return 'No messages yet'
    
    const preview = lastMessage.content.slice(0, 60)
    return preview.length < lastMessage.content.length ? `${preview}...` : preview
  }

  const getUserDisplayName = () => {
    if (!user?.email) return 'User'
    return user.email.split('@')[0]
  }

  const getUserInitial = () => {
    if (!user?.email) return 'U'
    return user.email[0].toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="w-[260px] flex flex-col h-screen" style={{ backgroundColor: '#f9fbff' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onNewChat}
          className="
            w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 
            rounded-lg transition-colors flex items-center justify-center gap-2
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
            <path d="M12 5v14m-7-7h14"/>
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-gray-400 mb-2">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="mx-auto"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId
              
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`
                    w-full text-left p-3 rounded-lg mb-1 transition-colors
                    ${isActive 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-white/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`
                      font-medium text-sm truncate flex-1 mr-2
                      ${isActive 
                        ? 'text-blue-900' 
                        : 'text-gray-900'
                      }
                    `}>
                      {session.title}
                    </h4>
                    <span className={`
                      text-xs flex-shrink-0
                      ${isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-500'
                      }
                    `}>
                      {formatDate(session.updatedAt)}
                    </span>
                  </div>
                  
                  <p className={`
                    text-xs leading-relaxed
                    ${isActive 
                      ? 'text-blue-700' 
                      : 'text-gray-500'
                    }
                  `}>
                    {getLastMessage(session)}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* User Profile Section - Now shows real user data */}
      <div className="p-4 border-t border-gray-100">
        {user ? (
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
        ) : (
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Not signed in</p>
          </div>
        )}
      </div>
    </div>
  )
}
