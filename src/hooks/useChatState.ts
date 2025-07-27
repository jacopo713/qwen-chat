import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, chatSessionService } from '@/lib/firebase'
import { useErrorHandler } from './useErrorHandler'
import { 
  ChatSession, 
  CreateChatSessionInput, 
  UpdateChatSessionInput,
  ChatSessionFilters 
} from '@/types'

interface UseChatStateOptions {
  autoLoad?: boolean
  defaultSessionId?: string
}

interface UseChatStateReturn {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  loading: boolean
  error: string | null
  createSession: (title: string, metadata?: Record<string, any>) => Promise<ChatSession>
  updateSession: (sessionId: string, updates: UpdateChatSessionInput) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  setCurrentSession: (session: ChatSession | null) => void
  refreshSessions: () => Promise<void>
  clearError: () => void
}

export const useChatState = (options: UseChatStateOptions = {}): UseChatStateReturn => {
  const { autoLoad = true, defaultSessionId } = options
  const [user] = useAuthState(auth)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorHandler()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load sessions when user is available
  useEffect(() => {
    if (!user || !autoLoad) return

    loadSessions()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [user, autoLoad])

  // Set default session
  useEffect(() => {
    if (defaultSessionId && sessions.length > 0) {
      const defaultSession = sessions.find(s => s.id === defaultSessionId)
      if (defaultSession) {
        setCurrentSession(defaultSession)
      }
    }
  }, [defaultSessionId, sessions])

  const loadSessions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // Subscribe to real-time session updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }

      unsubscribeRef.current = chatSessionService.subscribeToSessions(
        { userId: user.uid, isActive: true },
        (newSessions) => {
          setSessions(newSessions)
          setLoading(false)
          
          // If current session is deleted, clear it
          if (currentSession && !newSessions.find(s => s.id === currentSession.id)) {
            setCurrentSession(null)
          }
        }
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nel caricamento delle sessioni')
      setLoading(false)
    }
  }, [user, currentSession, setError])

  const createSession = useCallback(async (
    title: string, 
    metadata?: Record<string, any>
  ): Promise<ChatSession> => {
    if (!user) {
      throw new Error('Utente non autenticato')
    }

    setLoading(true)
    try {
      const input: CreateChatSessionInput = {
        title: title.trim() || 'Nuova Chat',
        userId: user.uid,
        metadata
      }

      const newSession = await chatSessionService.createSession(input)
      
      // Auto-select the new session
      setCurrentSession(newSession)
      clearError()
      
      return newSession
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nella creazione della sessione'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, setError, clearError])

  const updateSession = useCallback(async (
    sessionId: string, 
    updates: UpdateChatSessionInput
  ): Promise<void> => {
    setLoading(true)
    try {
      await chatSessionService.updateSession(sessionId, updates)
      
      // Update current session if it's the one being updated
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...updates } : null)
      }
      
      clearError()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nell\'aggiornamento della sessione')
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentSession, setError, clearError])

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    setLoading(true)
    try {
      await chatSessionService.deleteSession(sessionId)
      
      // Clear current session if it's the one being deleted
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(null)
      }
      
      clearError()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nell\'eliminazione della sessione')
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentSession, setError, clearError])

  const refreshSessions = useCallback(async (): Promise<void> => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await chatSessionService.getSessions({ 
        userId: user.uid, 
        isActive: true 
      })
      setSessions(result.sessions)
      clearError()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nel refresh delle sessioni')
    } finally {
      setLoading(false)
    }
  }, [user, setError, clearError])

  return {
    currentSession,
    sessions,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    setCurrentSession,
    refreshSessions,
    clearError
  }
}

// Hook per gestire la persistenza della sessione corrente
export const useSessionPersistence = () => {
  const STORAGE_KEY = 'current-chat-session'

  const saveCurrentSession = useCallback((session: ChatSession | null) => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          id: session.id,
          title: session.title
        }))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.warn('Impossibile salvare la sessione corrente:', error)
    }
  }, [])

  const loadCurrentSession = useCallback((): { id: string; title: string } | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.warn('Impossibile caricare la sessione salvata:', error)
      return null
    }
  }, [])

  const clearSavedSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Impossibile rimuovere la sessione salvata:', error)
    }
  }, [])

  return {
    saveCurrentSession,
    loadCurrentSession,
    clearSavedSession
  }
}

// Hook per statistiche delle sessioni
export const useSessionStats = (sessions: ChatSession[]) => {
  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => s.isActive).length,
    totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
    averageMessagesPerSession: sessions.length > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + s.messageCount, 0) / sessions.length)
      : 0,
    mostActiveSession: sessions.reduce((most, current) => 
      current.messageCount > (most?.messageCount || 0) ? current : most, null as ChatSession | null
    ),
    oldestSession: sessions.reduce((oldest, current) => 
      !oldest || current.createdAt < oldest.createdAt ? current : oldest, null as ChatSession | null
    ),
    newestSession: sessions.reduce((newest, current) => 
      !newest || current.createdAt > newest.createdAt ? current : newest, null as ChatSession | null
    )
  }

  return stats
}

export default useChatState
