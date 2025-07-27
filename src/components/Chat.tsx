import React, { useEffect, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { useMessages } from '@/hooks/useMessages'
import { useChatState } from '@/hooks/useChatState'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import MessageList from './chat/MessageList'
import MessageInput from './chat/MessageInput'
import ChatHeader from './chat/ChatHeader'
import ErrorBanner from './ui/ErrorBanner'
import LoadingSpinner from './ui/LoadingSpinner'

interface ChatProps {
  sessionId?: string
  className?: string
  onSessionChange?: (sessionId: string | null) => void
}

export default function Chat({ sessionId = 'default', className = '', onSessionChange }: ChatProps) {
  const [user] = useAuthState(auth)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // Chat state management
  const { 
    currentSession, 
    setCurrentSession, 
    createSession,
    loading: sessionLoading,
    error: sessionError,
    clearError: clearSessionError
  } = useChatState({
    defaultSessionId: sessionId
  })

  // Messages management
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendTextMessage,
    sendFileMessage,
    clearError: clearMessagesError
  } = useMessages({
    sessionId: currentSession?.id || sessionId,
    onNewMessage: () => {
      // Auto scroll to bottom on new message
      scrollToBottom()
    }
  })

  // Global error handling
  const { error: globalError, setError: setGlobalError, clearError: clearGlobalError } = useErrorHandler({
    autoCleatDuration: 6000
  })

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle session creation if no current session
  useEffect(() => {
    if (user && !currentSession && !sessionLoading) {
      createSession('Nuova Chat')
        .then((session) => {
          onSessionChange?.(session.id)
        })
        .catch((error) => {
          setGlobalError('Impossibile creare una nuova sessione')
        })
    }
  }, [user, currentSession, sessionLoading, createSession, onSessionChange, setGlobalError])

  // Handle text message send
  const handleSendMessage = async (content: string) => {
    try {
      await sendTextMessage(content)
    } catch (error) {
      setGlobalError('Impossibile inviare il messaggio')
    }
  }

  // Handle file message send
  const handleSendFile = async (file: any, content?: string) => {
    try {
      await sendFileMessage(file, content)
    } catch (error) {
      setGlobalError('Impossibile inviare il file')
    }
  }

  // Combine all errors
  const currentError = globalError || sessionError || messagesError
  const clearCurrentError = () => {
    clearGlobalError()
    clearSessionError()
    clearMessagesError()
  }

  // Show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Effettua il login per iniziare a chattare</p>
        </div>
      </div>
    )
  }

  if (sessionLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" message="Caricamento chat..." />
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Error Banner */}
      {currentError && (
        <ErrorBanner 
          error={currentError} 
          onClose={clearCurrentError}
          className="mb-4"
        />
      )}

      {/* Chat Header */}
      <ChatHeader 
        session={currentSession}
        onSessionUpdate={(updates) => {
          if (currentSession) {
            // Handle session updates if needed
          }
        }}
        className="border-b border-gray-200 dark:border-gray-700"
      />

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <MessageList 
          messages={messages}
          currentUserId={user.uid}
          loading={messagesLoading}
        />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        disabled={!currentSession}
        className="border-t border-gray-200 dark:border-gray-700"
      />
    </div>
  )
}
