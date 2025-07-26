'use client'

import React from 'react'
import { useChatState } from '@/hooks/useChatState'
import ChatSidebar from './ChatSidebar'
import ChatArea from './ChatArea'
import ChatInput from './ChatInput'
import ErrorBanner from './ErrorBanner'

export default function ChatLayout() {
  const { 
    currentSession, 
    sessions, 
    isLoading, 
    error,
    sendMessage, 
    createNewSession, 
    switchSession,
    clearError
  } = useChatState()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSelectSession={switchSession}
        onNewChat={createNewSession}
      />

      {/* Main Chat Area - Standard chatbot centering */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Error Banner */}
        <ErrorBanner error={error} onDismiss={clearError} />
        
        <ChatArea 
          session={currentSession} 
          isLoading={isLoading} 
        />
        
        {/* Chat Input */}
        {currentSession && (
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything about coding..."
          />
        )}
      </div>
    </div>
  )
}
