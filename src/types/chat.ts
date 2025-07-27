import { FileMetadata } from './file'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isLoading?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  attachedFiles: FileMetadata[] // Files as context, not messages
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
  attachedFiles?: FileMetadata[]
  onRemoveFile?: (fileId: string) => void
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
  attachedFiles?: FileMetadata[] // Include files as context
}

export interface StreamChunk {
  content: string
}

// File attachment display component
export interface AttachedFileProps {
  file: FileMetadata
  onRemove: (fileId: string) => void
  className?: string
}
