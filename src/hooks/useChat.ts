import { useState, useCallback, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { FileMetadata } from '@/types/file'
import { ChatMessage, TextMessage, FileMessage } from '@/types/chat'

interface UseChatReturn {
  messages: ChatMessage[]
  sendTextMessage: (content: string) => Promise<void>
  sendFileMessage: (file: FileMetadata, content?: string) => Promise<void>
  loading: boolean
  error: string | null
  clearError: () => void
}

export const useChat = (chatId: string = 'general'): UseChatReturn => {
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Listen to messages
  useEffect(() => {
    if (!user) {
      setMessages([])
      setLoading(false)
      return
    }

    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: ChatMessage[] = snapshot.docs.map(doc => {
          const data = doc.data()
          const timestamp = data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date()

          const baseMessage = {
            id: doc.id,
            content: data.content || '',
            timestamp,
            userId: data.userId
          }

          // Handle different message types
          if (data.type === 'file' && data.file) {
            return {
              ...baseMessage,
              type: 'file',
              file: data.file
            } as FileMessage
          } else {
            return {
              ...baseMessage,
              type: 'text'
            } as TextMessage
          }
        })

        setMessages(newMessages)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error fetching messages:', error)
        setError('Failed to load messages')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, chatId])

  const sendTextMessage = useCallback(async (content: string): Promise<void> => {
    if (!user || !content.trim()) {
      throw new Error('User not authenticated or content is empty')
    }

    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`)
      await addDoc(messagesRef, {
        type: 'text',
        content: content.trim(),
        userId: user.uid,
        timestamp: serverTimestamp()
      })
      
      clearError()
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setError(errorMessage)
      throw error
    }
  }, [user, chatId, clearError])

  const sendFileMessage = useCallback(async (
    file: FileMetadata, 
    content: string = ''
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`)
      await addDoc(messagesRef, {
        type: 'file',
        content: content.trim(),
        file: {
          id: file.id,
          name: file.name,
          originalName: file.originalName,
          type: file.type,
          size: file.size,
          url: file.url,
          uploadedAt: file.uploadedAt,
          uploadedBy: file.uploadedBy,
          storagePath: file.storagePath
        },
        userId: user.uid,
        timestamp: serverTimestamp()
      })
      
      clearError()
    } catch (error) {
      console.error('Error sending file message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send file'
      setError(errorMessage)
      throw error
    }
  }, [user, chatId, clearError])

  return {
    messages,
    sendTextMessage,
    sendFileMessage,
    loading,
    error,
    clearError
  }
}
