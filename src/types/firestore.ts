import { Timestamp } from 'firebase/firestore'

// Firestore document structure for chat messages
export interface FirestoreMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Timestamp | null
}

// Firestore document structure for chat sessions
export interface FirestoreChatSession {
  id: string
  title: string
  messages: FirestoreMessage[]
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  userId: string
}

// Input type for creating new chat sessions
export interface CreateChatSessionInput {
  title?: string
  userId: string
}

// Input type for updating chat sessions
export interface UpdateChatSessionInput {
  title?: string
  messages?: FirestoreMessage[]
  updatedAt: Timestamp | null
}

// Search/filter options for chat sessions
export interface ChatSessionFilters {
  userId: string
  limit?: number
  orderBy?: 'createdAt' | 'updatedAt'
  orderDirection?: 'asc' | 'desc'
}

// Result type for paginated chat sessions
export interface ChatSessionsResult {
  sessions: FirestoreChatSession[]
  hasMore: boolean
  lastDoc?: any // DocumentSnapshot
}
