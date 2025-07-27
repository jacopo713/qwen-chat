'use client'

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { ChatSession, Message, ChatState } from '@/types/chat'
import { useFirestoreChats } from '@/hooks/useFirestoreChats'
import { useAuth } from './AuthContext'
import { ChatService } from '@/lib/chatService'

interface ChatContextType extends ChatState {
  // Session management
  createNewSession: (title?: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  switchToSession: (sessionId: string) => void
  
  // Message management
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  
  // Session utilities
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>
  saveCurrentSession: () => Promise<void>
  clearCurrentSession: () => void
  
  // State management
  clearError: () => void
  setIsLoading: (loading: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const {
    sessions,
    currentSession,
    isLoading: firestoreLoading,
    error: firestoreError,
    createNewSession: createFirestoreSession,
    loadSession: loadFirestoreSession,
    deleteSession: deleteFirestoreSession,
    updateSessionTitle: updateFirestoreTitle,
    addMessageToCurrentSession,
    saveCurrentSession: saveFirestoreSession,
    setCurrentSession,
    clearError: clearFirestoreError
  } = useFirestoreChats({ autoSave: false, autoSaveDelay: 2000 })

  // Local chat state
  const [localIsLoading, setLocalIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Combined loading and error states
  const isLoading = firestoreLoading || localIsLoading
  const error = firestoreError || localError

  // Clear combined errors
  const clearError = useCallback(() => {
    clearFirestoreError()
    setLocalError(null)
  }, [clearFirestoreError])

  // Create new session with auto-generated title
  const createNewSession = useCallback(async (title?: string): Promise<void> => {
    if (!user) {
      setLocalError('You must be signed in to create a chat session')
      return
    }

    setLocalIsLoading(true)
    setLocalError(null)

    try {
      await createFirestoreSession(title || 'New Chat')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session'
      setLocalError(errorMessage)
      throw error
    } finally {
      setLocalIsLoading(false)
    }
  }, [user, createFirestoreSession])

  // Load specific session
  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    setLocalIsLoading(true)
    setLocalError(null)

    try {
      await loadFirestoreSession(sessionId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session'
      setLocalError(errorMessage)
      throw error
    } finally {
      setLocalIsLoading(false)
    }
  }, [loadFirestoreSession])

  // Switch to existing session
  const switchToSession = useCallback((sessionId: string) => {
    const targetSession = sessions.find(s => s.id === sessionId)
    if (targetSession) {
      setCurrentSession(targetSession)
    }
  }, [sessions, setCurrentSession])

  // Delete session
  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    setLocalIsLoading(true)
    setLocalError(null)

    try {
      await deleteFirestoreSession(sessionId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session'
      setLocalError(errorMessage)
      throw error
    } finally {
      setLocalIsLoading(false)
    }
  }, [deleteFirestoreSession])

  // Send message with AI response - NO WELCOME MESSAGE
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!user) {
      setLocalError('You must be signed in to send messages')
      return
    }

    setLocalIsLoading(true)
    setLocalError(null)

    try {
      let sessionToUse = currentSession

      // Create new session immediately if none exists - WITHOUT WELCOME MESSAGE
      if (!sessionToUse) {
        const title = ChatService.generateChatTitle(content)
        const newSessionId = `session-${Date.now()}`
        
        // Create session object immediately for UI - EMPTY MESSAGES
        sessionToUse = {
          id: newSessionId,
          title,
          messages: [], // NO WELCOME MESSAGE
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Update local state immediately
        setCurrentSession(sessionToUse)

        // Create in Firestore asynchronously
        createFirestoreSession(title).catch(console.error)
      }

      // Add user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date()
      }

      const updatedSession = {
        ...sessionToUse,
        messages: [...sessionToUse.messages, userMessage],
        updatedAt: new Date()
      }

      // Update local state immediately
      setCurrentSession(updatedSession)

      // Add loading assistant message
      const loadingMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isLoading: true
      }

      const sessionWithLoading = {
        ...updatedSession,
        messages: [...updatedSession.messages, loadingMessage],
        updatedAt: new Date()
      }

      // Update local state with loading message
      setCurrentSession(sessionWithLoading)

      // Call AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedSession.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      let assistantContent = ''
      const decoder = new TextDecoder()

      // Read stream and update message content
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantContent += parsed.content
                
                // Update the loading message with streaming content
                setCurrentSession(prev => {
                  if (!prev) return prev
                  
                  const updatedMessages = prev.messages.map(msg =>
                    msg.id === loadingMessage.id
                      ? { ...msg, content: assistantContent, isLoading: true }
                      : msg
                  )
                  
                  return {
                    ...prev,
                    messages: updatedMessages,
                    updatedAt: new Date()
                  }
                })
              }
            } catch (parseError) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Final update - remove loading state
      const finalSession = {
        ...sessionWithLoading,
        messages: sessionWithLoading.messages.map(msg =>
          msg.id === loadingMessage.id
            ? { ...msg, content: assistantContent, isLoading: false }
            : msg
        ),
        updatedAt: new Date()
      }

      setCurrentSession(finalSession)

      // MANUAL SAVE after streaming is complete
      try {
        await ChatService.saveChatSession(finalSession.id, finalSession, user.uid)
      } catch (saveError) {
        console.error('Failed to save session after streaming:', saveError)
        // Don't throw - UI should still work even if save fails
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setLocalError(errorMessage)
      
      // Remove loading message on error
      setCurrentSession(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: prev.messages.filter(msg => !msg.isLoading),
          updatedAt: new Date()
        }
      })
    } finally {
      setLocalIsLoading(false)
    }
  }, [user, currentSession, createFirestoreSession, setCurrentSession])

  // Add message directly (for programmatic use)
  const addMessage = useCallback(async (message: Message): Promise<void> => {
    if (!currentSession) {
      setLocalError('No active session to add message to')
      return
    }

    try {
      await addMessageToCurrentSession(message)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add message'
      setLocalError(errorMessage)
    }
  }, [currentSession, addMessageToCurrentSession])

  // Update specific message
  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    if (!currentSession) return

    setCurrentSession(prev => {
      if (!prev) return prev
      
      const updatedMessages = prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
      
      return {
        ...prev,
        messages: updatedMessages,
        updatedAt: new Date()
      }
    })
  }, [currentSession, setCurrentSession])

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string): Promise<void> => {
    setLocalIsLoading(true)
    setLocalError(null)

    try {
      await updateFirestoreTitle(sessionId, title)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update session title'
      setLocalError(errorMessage)
      throw error
    } finally {
      setLocalIsLoading(false)
    }
  }, [updateFirestoreTitle])

  // Save current session manually
  const saveCurrentSession = useCallback(async (): Promise<void> => {
    if (!currentSession) {
      setLocalError('No current session to save')
      return
    }

    setLocalIsLoading(true)
    setLocalError(null)

    try {
      await saveFirestoreSession()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save session'
      setLocalError(errorMessage)
      throw error
    } finally {
      setLocalIsLoading(false)
    }
  }, [currentSession, saveFirestoreSession])

  // Clear current session
  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null)
  }, [setCurrentSession])

  // Auto-create first session when user signs in and has no sessions - EMPTY SESSION
  useEffect(() => {
    if (user && sessions.length === 0 && !currentSession && !isLoading) {
      // Create initial empty session
      const emptySession: ChatSession = {
        id: `empty-${Date.now()}`,
        title: 'New Chat',
        messages: [], // NO WELCOME MESSAGE
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setCurrentSession(emptySession)
    }
  }, [user, sessions.length, currentSession, isLoading, setCurrentSession])

  const value: ChatContextType = {
    // State
    currentSession,
    sessions,
    isLoading,
    error,
    
    // Session management
    createNewSession,
    loadSession,
    deleteSession,
    switchToSession,
    
    // Message management
    sendMessage,
    addMessage,
    updateMessage,
    
    // Session utilities
    updateSessionTitle,
    saveCurrentSession,
    clearCurrentSession,
    
    // State management
    clearError,
    setIsLoading: setLocalIsLoading
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
