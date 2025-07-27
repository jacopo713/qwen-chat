import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  DocumentReference,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import {
  FirestoreChatSession,
  FirestoreMessage,
  CreateChatSessionInput,
  UpdateChatSessionInput,
  ChatSessionFilters,
  ChatSessionsResult
} from '@/types/firestore'
import { Message, ChatSession } from '@/types/chat'

// Collection name for chat sessions
const CHATS_COLLECTION = 'chats'

// Convert Firestore Timestamp to Date with null safety
const timestampToDate = (timestamp: Timestamp | null | undefined): Date => {
  if (!timestamp || timestamp === null) {
    return new Date() // Fallback to current date
  }
  
  // Handle serverTimestamp placeholders
  if (typeof timestamp.toDate !== 'function') {
    return new Date() // Fallback for placeholder timestamps
  }
  
  return timestamp.toDate()
}

// Convert Date to Firestore Timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date)
}

// Convert Firestore message to app message with safety checks
const firestoreMessageToMessage = (firestoreMessage: FirestoreMessage): Message => ({
  id: firestoreMessage.id || `msg-${Date.now()}`,
  content: firestoreMessage.content || '',
  role: firestoreMessage.role || 'user',
  timestamp: timestampToDate(firestoreMessage.timestamp)
})

// Convert app message to Firestore message
const messageToFirestoreMessage = (message: Message): FirestoreMessage => ({
  id: message.id,
  content: message.content,
  role: message.role,
  timestamp: dateToTimestamp(message.timestamp)
})

// Convert Firestore session to app session with safety checks
const firestoreSessionToSession = (firestoreSession: FirestoreChatSession): ChatSession => ({
  id: firestoreSession.id || `session-${Date.now()}`,
  title: firestoreSession.title || 'Untitled Chat',
  messages: (firestoreSession.messages || []).map(firestoreMessageToMessage),
  createdAt: timestampToDate(firestoreSession.createdAt),
  updatedAt: timestampToDate(firestoreSession.updatedAt)
})

// Convert app session to Firestore session
const sessionToFirestoreSession = (session: ChatSession, userId: string): Omit<FirestoreChatSession, 'id'> => ({
  title: session.title,
  messages: session.messages.map(messageToFirestoreMessage),
  createdAt: dateToTimestamp(session.createdAt),
  updatedAt: dateToTimestamp(session.updatedAt),
  userId
})

export class ChatService {
  // Create a new chat session
  static async createChatSession(input: CreateChatSessionInput): Promise<string> {
    try {
      const now = new Date()
      const chatData: Omit<FirestoreChatSession, 'id'> = {
        title: input.title || 'New Chat',
        messages: [],
        createdAt: dateToTimestamp(now),
        updatedAt: dateToTimestamp(now),
        userId: input.userId
      }

      const docRef = await addDoc(collection(db, CHATS_COLLECTION), chatData)
      return docRef.id
    } catch (error) {
      console.error('Error creating chat session:', error)
      throw new Error('Failed to create chat session')
    }
  }

  // Save/update an existing chat session
  static async saveChatSession(sessionId: string, session: ChatSession, userId: string): Promise<void> {
    try {
      const sessionRef = doc(db, CHATS_COLLECTION, sessionId)
      const firestoreSession = sessionToFirestoreSession(session, userId)
      
      await updateDoc(sessionRef, {
        ...firestoreSession,
        updatedAt: dateToTimestamp(new Date())
      })
    } catch (error) {
      console.error('Error saving chat session:', error)
      throw new Error('Failed to save chat session')
    }
  }

  // Get a specific chat session by ID
  static async getChatSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    try {
      const sessionRef = doc(db, CHATS_COLLECTION, sessionId)
      const docSnap = await getDoc(sessionRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data() as FirestoreChatSession
      
      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to chat session')
      }

      return firestoreSessionToSession({ ...data, id: docSnap.id })
    } catch (error) {
      console.error('Error getting chat session:', error)
      throw new Error('Failed to get chat session')
    }
  }

  // Get all chat sessions for a user - SIMPLIFIED QUERY
  static async getUserChatSessions(filters: ChatSessionFilters): Promise<ChatSession[]> {
    try {
      const chatsRef = collection(db, CHATS_COLLECTION)
      
      // Simple query to avoid composite index requirement
      let q = query(
        chatsRef,
        where('userId', '==', filters.userId)
      )

      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }

      const querySnapshot = await getDocs(q)
      const sessions: ChatSession[] = []

      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data() as FirestoreChatSession
          sessions.push(firestoreSessionToSession({ ...data, id: doc.id }))
        } catch (error) {
          console.error('Error processing session document:', error)
          // Skip invalid documents
        }
      })

      // Sort in memory to avoid composite index
      sessions.sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt
        const dateB = b.updatedAt || b.createdAt
        return dateB.getTime() - dateA.getTime()
      })

      return sessions
    } catch (error) {
      console.error('Error getting user chat sessions:', error)
      throw new Error('Failed to get chat sessions')
    }
  }

  // Delete a chat session
  static async deleteChatSession(sessionId: string, userId: string): Promise<void> {
    try {
      // First verify ownership
      const session = await this.getChatSession(sessionId, userId)
      if (!session) {
        throw new Error('Chat session not found or unauthorized')
      }

      const sessionRef = doc(db, CHATS_COLLECTION, sessionId)
      await deleteDoc(sessionRef)
    } catch (error) {
      console.error('Error deleting chat session:', error)
      throw new Error('Failed to delete chat session')
    }
  }

  // Subscribe to user's chat sessions with real-time updates - SIMPLIFIED
  static subscribeToUserChatSessions(
    userId: string,
    callback: (sessions: ChatSession[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const chatsRef = collection(db, CHATS_COLLECTION)
      
      // Simple query without orderBy to avoid composite index
      const q = query(
        chatsRef,
        where('userId', '==', userId)
      )

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const sessions: ChatSession[] = []
          
          querySnapshot.forEach((doc) => {
            try {
              const data = doc.data() as FirestoreChatSession
              sessions.push(firestoreSessionToSession({ ...data, id: doc.id }))
            } catch (error) {
              console.error('Error processing session document in subscription:', error)
              // Skip invalid documents
            }
          })
          
          // Sort in memory by updatedAt descending
          sessions.sort((a, b) => {
            const dateA = a.updatedAt || a.createdAt
            const dateB = b.updatedAt || b.createdAt
            return dateB.getTime() - dateA.getTime()
          })
          
          callback(sessions)
        },
        (error) => {
          console.error('Error in chat sessions subscription:', error)
          if (onError) {
            onError(new Error('Failed to sync chat sessions'))
          }
        }
      )

      return unsubscribe
    } catch (error) {
      console.error('Error setting up chat sessions subscription:', error)
      throw new Error('Failed to setup real-time sync')
    }
  }

  // Update chat session title
  static async updateChatTitle(sessionId: string, title: string, userId: string): Promise<void> {
    try {
      // Verify ownership first
      const session = await this.getChatSession(sessionId, userId)
      if (!session) {
        throw new Error('Chat session not found or unauthorized')
      }

      const sessionRef = doc(db, CHATS_COLLECTION, sessionId)
      await updateDoc(sessionRef, {
        title,
        updatedAt: dateToTimestamp(new Date())
      })
    } catch (error) {
      console.error('Error updating chat title:', error)
      throw new Error('Failed to update chat title')
    }
  }

  // Add a single message to existing chat session
  static async addMessageToSession(
    sessionId: string,
    message: Message,
    userId: string
  ): Promise<void> {
    try {
      const session = await this.getChatSession(sessionId, userId)
      if (!session) {
        throw new Error('Chat session not found or unauthorized')
      }

      const updatedMessages = [...session.messages, message]
      const sessionRef = doc(db, CHATS_COLLECTION, sessionId)
      
      await updateDoc(sessionRef, {
        messages: updatedMessages.map(messageToFirestoreMessage),
        updatedAt: dateToTimestamp(new Date())
      })
    } catch (error) {
      console.error('Error adding message to session:', error)
      throw new Error('Failed to add message to session')
    }
  }

  // Generate automatic title from first message
  static generateChatTitle(firstMessage: string): string {
    const maxLength = 50
    const cleaned = firstMessage.trim().replace(/\n/g, ' ')
    
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    
    return cleaned.substring(0, maxLength).trim() + '...'
  }
}
