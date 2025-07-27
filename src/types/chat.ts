import { FileMetadata } from './file'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isLoading?: boolean
  file?: FileMetadata // Add file support
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive?: boolean
}

export interface ChatState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isLoading: boolean
  error: string | null
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void
  onDeepThink?: () => void
  onAttachFile?: () => void
  onFileUploaded?: (file: FileMetadata) => void
  isLoading?: boolean
  placeholder?: string
}

export interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

export interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ApiRequest {
  messages: ApiMessage[]
}

export interface StreamChunk {
  content: string
}
