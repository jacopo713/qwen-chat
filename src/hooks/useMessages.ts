import { useState, useEffect, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, messageService } from '@/lib/firebase'
import { useErrorHandler } from './useErrorHandler'
import { ChatMessage, FileMetadata } from '@/types'

interface UseMessagesOptions {
  sessionId: string
  autoScroll?: boolean
  onNewMessage?: (message: ChatMessage) => void
}

interface UseMessagesReturn {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  sendTextMessage: (content: string) => Promise<void>
  sendFileMessage: (file: FileMetadata, content?: string) => Promise<void>
  clearError: () => void
  refreshMessages: () => void
}

export const useMessages = (options: UseMessagesOptions): UseMessagesReturn => {
  const { sessionId, autoScroll = true, onNewMessage } = options
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const { error, setError, clearError } = useErrorHandler({
    autoCleatDuration: 5000
  })

  // Subscribe to messages
  useEffect(() => {
    if (!user || !sessionId) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = messageService.subscribeToMessages(
      sessionId,
      (newMessages) => {
        setMessages(prevMessages => {
          // Check if there are new messages
          if (newMessages.length > prevMessages.length) {
            const latestMessage = newMessages[newMessages.length - 1]
            onNewMessage?.(latestMessage)
          }
          return newMessages
        })
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user, sessionId, onNewMessage])

  // Send text message
  const sendTextMessage = useCallback(async (content: string) => {
    if (!user || !sessionId || !content.trim()) {
      setError('Impossibile inviare il messaggio')
      return
    }

    try {
      await messageService.sendTextMessage(sessionId, content.trim(), user.uid)
      clearError()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nell\'invio del messaggio')
      throw error
    }
  }, [user, sessionId, setError, clearError])

  // Send file message
  const sendFileMessage = useCallback(async (file: FileMetadata, content = '') => {
    if (!user || !sessionId) {
      setError('Impossibile inviare il file')
      return
    }

    try {
      await messageService.sendFileMessage(sessionId, file, content, user.uid)
      clearError()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nell\'invio del file')
      throw error
    }
  }, [user, sessionId, setError, clearError])

  // Refresh messages manually
  const refreshMessages = useCallback(() => {
    if (user && sessionId) {
      setLoading(true)
      // Re-subscribe will trigger a refresh
      // This is a simple implementation - could be optimized
    }
  }, [user, sessionId])

  return {
    messages,
    loading,
    error,
    sendTextMessage,
    sendFileMessage,
    clearError,
    refreshMessages
  }
}

// Hook per gestire un singolo messaggio con azioni
export const useMessageActions = () => {
  const { error, setError, clearError } = useErrorHandler()

  const copyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Potresti voler mostrare un toast di successo qui
    } catch (error) {
      setError('Impossibile copiare il messaggio')
    }
  }, [setError])

  const shareMessage = useCallback(async (content: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Messaggio condiviso',
          text: content
        })
      } else {
        await copyMessage(content)
        // Fallback: copia negli appunti
      }
    } catch (error) {
      setError('Impossibile condividere il messaggio')
    }
  }, [setError, copyMessage])

  const downloadMessage = useCallback((content: string, filename = 'messaggio.txt') => {
    try {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setError('Impossibile scaricare il messaggio')
    }
  }, [setError])

  return {
    error,
    clearError,
    copyMessage,
    shareMessage,
    downloadMessage
  }
}

// Hook per gestire la digitazione (typing indicators)
export const useTypingIndicator = (sessionId: string) => {
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const startTyping = useCallback(() => {
    setIsTyping(true)
    // In una implementazione reale, potresti voler inviare questo stato al server
  }, [])

  const stopTyping = useCallback(() => {
    setIsTyping(false)
  }, [])

  // Auto-stop typing after inactivity
  useEffect(() => {
    if (!isTyping) return

    const timeout = setTimeout(() => {
      stopTyping()
    }, 3000) // Stop typing after 3 seconds of inactivity

    return () => clearTimeout(timeout)
  }, [isTyping, stopTyping])

  return {
    isTyping,
    typingUsers,
    startTyping,
    stopTyping
  }
}

export default useMessages
