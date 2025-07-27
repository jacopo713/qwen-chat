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
import { FileMetadata, FileMessage } from '@/types/file'

export interface TextMessage {
  id: string
  type: 'text'
  content: string
  timestamp: Date
  userId: string
}

export type ChatMessage = TextMessage | FileMessage

interface UseChatReturn {
  messages: ChatMessage[]
  sendTextMessage: (content: string) => Promise<void>
  sendFileMessage: (file: FileMetadata, content?: string) => Promise<void>
  loading: boolean
  error: string | null
}

export const useChat = (chatId: string = 'general'): UseChatReturn => {
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

          return {
            id: doc.id,
            ...data,
            timestamp
          } as ChatMessage
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
    if (!user || !content.trim()) return

    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`)
      await addDoc(messagesRef, {
        type: 'text',
        content: content.trim(),
        userId: user.uid,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
      throw error
    }
  }, [user, chatId])

  const sendFileMessage = useCallback(async (
    file: FileMetadata, 
    content: string = ''
  ): Promise<void> => {
    if (!user) return

    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`)
      await addDoc(messagesRef, {
        type: 'file',
        content,
        file,
        userId: user.uid,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Error sending file message:', error)
      setError('Failed to send file')
      throw error
    }
  }, [user, chatId])

  return {
    messages,
    sendTextMessage,
    sendFileMessage,
    loading,
    error
  }
}
