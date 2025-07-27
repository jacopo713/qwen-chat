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

  // Check if we're in initial state (only welcome message)
  const isInitialState = currentSession?.messages.length === 1

  // Handler per DeepThink
  const handleDeepThink = () => {
    console.log('DeepThink activated')
    // TODO: Implementare logica DeepThink
  }

  // Handler per attach file
  const handleAttachFile = () => {
    console.log('Attach file clicked')
    // TODO: Implementare logica upload file
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSelectSession={switchSession}
        onNewChat={createNewSession}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-[400px]">
        {/* Error Banner */}
        <ErrorBanner error={error} onDismiss={clearError} />
        
        {/* Conditional Layout based on conversation state */}
        {isInitialState ? (
          // Initial state: centered input with welcome message above
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
            <div className="w-full max-w-4xl md:max-w-3xl min-w-[400px]">
              {/* Welcome Message */}
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-white text-3xl font-bold">Q</span>
                </div>
                <div className="text-gray-900 text-2xl leading-relaxed whitespace-pre-line">
                  {currentSession?.messages[0]?.content}
                </div>
              </div>
              
              {/* Centered Input */}
              <ChatInput
                onSendMessage={sendMessage}
                onDeepThink={handleDeepThink}
                onAttachFile={handleAttachFile}
                isLoading={isLoading}
                placeholder="Ask me anything about coding..."
              />
            </div>
          </div>
        ) : (
          // Conversation state: normal layout with messages and bottom input
          <>
            <ChatArea 
              session={currentSession} 
              isLoading={isLoading} 
            />
            
            {/* Bottom Input */}
            {currentSession && (
              <ChatInput
                onSendMessage={sendMessage}
                onDeepThink={handleDeepThink}
                onAttachFile={handleAttachFile}
                isLoading={isLoading}
                placeholder="Ask me anything about coding..."
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
