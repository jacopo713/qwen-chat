import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatService } from '@/lib/chatService'
import { ChatSession, Message } from '@/types/chat'
import { useAuth } from '@/context/AuthContext'

interface UseFirestoreChatsOptions {
  autoSave?: boolean
  autoSaveDelay?: number // milliseconds
}

interface UseFirestoreChatsReturn {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  isLoading: boolean
  error: string | null
  createNewSession: (title?: string) => Promise<string>
  loadSession: (sessionId: string) => Promise<void>
  saveCurrentSession: () => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>
  addMessageToCurrentSession: (message: Message) => Promise<void>
  setCurrentSession: (session: ChatSession | null) => void
  clearError: () => void
}

export function useFirestoreChats(options: UseFirestoreChatsOptions = {}): UseFirestoreChatsReturn {
  const { autoSave = true, autoSaveDelay = 1000 } = options
  const { user } = useAuth()
  
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Auto-save timeout ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Clear any existing auto-save timeout
  const clearAutoSaveTimeout = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
      autoSaveTimeoutRef.current = null
    }
  }, [])

  // Schedule auto-save
  const scheduleAutoSave = useCallback(() => {
    if (!autoSave || !currentSession || !user) return

    clearAutoSaveTimeout()
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await ChatService.saveChatSession(currentSession.id, currentSession, user.uid)
      } catch (error) {
        console.error('Auto-save failed:', error)
        // Don't set error state for auto-save failures to avoid UI disruption
      }
    }, autoSaveDelay)
  }, [autoSave, currentSession, user, autoSaveDelay, clearAutoSaveTimeout])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Create new chat session
  const createNewSession = useCallback(async (title?: string): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to create chat session')
    }

    setIsLoading(true)
    setError(null)

    try {
      const sessionId = await ChatService.createChatSession({
        title: title || 'New Chat',
        userId: user.uid
      })

      const newSession: ChatSession = {
        id: sessionId,
        title: title || 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setCurrentSession(newSession)
      return sessionId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load specific chat session
  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to load chat session')
    }

    setIsLoading(true)
    setError(null)

    try {
      const session = await ChatService.getChatSession(sessionId, user.uid)
      if (!session) {
        throw new Error('Chat session not found')
      }
      setCurrentSession(session)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chat session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Save current session manually
  const saveCurrentSession = useCallback(async (): Promise<void> => {
    if (!currentSession || !user) {
      throw new Error('No current session or user to save')
    }

    setIsLoading(true)
    setError(null)

    try {
      await ChatService.saveChatSession(currentSession.id, currentSession, user.uid)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save chat session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, user])

  // Delete chat session
  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to delete chat session')
    }

    setIsLoading(true)
    setError(null)

    try {
      await ChatService.deleteChatSession(sessionId, user.uid)
      
      // If deleting current session, clear it
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete chat session'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, currentSession])

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to update chat session')
    }

    setIsLoading(true)
    setError(null)

    try {
      await ChatService.updateChatTitle(sessionId, title, user.uid)
      
      // Update current session if it matches
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title, updatedAt: new Date() } : null)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update chat title'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, currentSession])

  // Add message to current session
  const addMessageToCurrentSession = useCallback(async (message: Message): Promise<void> => {
    if (!currentSession) {
      throw new Error('No current session to add message to')
    }

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, message],
      updatedAt: new Date()
    }

    // Update local state immediately for better UX
    setCurrentSession(updatedSession)

    // Schedule auto-save if enabled
    if (autoSave) {
      scheduleAutoSave()
    }
  }, [currentSession, autoSave, scheduleAutoSave])

  // Subscribe to user's chat sessions when user changes
  useEffect(() => {
    if (!user) {
      setSessions([])
      setCurrentSession(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const unsubscribe = ChatService.subscribeToUserChatSessions(
        user.uid,
        (updatedSessions) => {
          setSessions(updatedSessions)
          setIsLoading(false)
        },
        (error) => {
          setError(error.message)
          setIsLoading(false)
        }
      )

      unsubscribeRef.current = unsubscribe
      return unsubscribe
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync chat sessions'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [user])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoSaveTimeout()
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [clearAutoSaveTimeout])

  // Auto-save when current session changes
  useEffect(() => {
    scheduleAutoSave()
  }, [scheduleAutoSave])

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    createNewSession,
    loadSession,
    saveCurrentSession,
    deleteSession,
    updateSessionTitle,
    addMessageToCurrentSession,
    setCurrentSession,
    clearError
  }
}
