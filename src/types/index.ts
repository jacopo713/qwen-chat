import { Timestamp } from 'firebase/firestore'

// =============================================================================
// CORE TYPES
// =============================================================================

export type UserRole = 'user' | 'assistant' | 'system'
export type MessageType = 'text' | 'file' | 'system'
export type FileCategory = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other'
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'
export type PhaseStatus = 'not-started' | 'in-progress' | 'completed' | 'paused'

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// =============================================================================
// MESSAGE & CHAT TYPES
// =============================================================================

export interface BaseMessage {
  id: string
  content: string
  role: UserRole
  timestamp: Date
  userId?: string
  sessionId?: string
}

export interface TextMessage extends BaseMessage {
  type: 'text'
}

export interface FileMessage extends BaseMessage {
  type: 'file'
  file: FileMetadata
}

export interface SystemMessage extends BaseMessage {
  type: 'system'
  role: 'system'
}

export type ChatMessage = TextMessage | FileMessage | SystemMessage

// Legacy Message interface for compatibility
export interface Message extends BaseMessage {
  type?: MessageType
  file?: FileMetadata
}

// =============================================================================
// CHAT SESSION TYPES
// =============================================================================

export interface ChatSession {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  lastMessage?: string
  isActive: boolean
  metadata?: Record<string, any>
}

export interface CreateChatSessionInput {
  title: string
  userId: string
  metadata?: Record<string, any>
}

export interface UpdateChatSessionInput {
  title?: string
  metadata?: Record<string, any>
  isActive?: boolean
}

export interface ChatSessionFilters {
  userId?: string
  isActive?: boolean
  startDate?: Date
  endDate?: Date
  limit?: number
}

export interface ChatSessionsResult {
  sessions: ChatSession[]
  total: number
  hasMore: boolean
}

// =============================================================================
// FILE TYPES
// =============================================================================

export interface FileMetadata {
  id: string
  name: string
  size: number
  type: string
  category: FileCategory
  url: string
  downloadUrl?: string
  thumbnailUrl?: string
  userId: string
  uploadedAt: Date
  path: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    [key: string]: any
  }
}

export interface FilePreview {
  id: string
  file: File
  preview: string
  category: FileCategory
  url?: string
}

export interface FileUploadResult {
  success: boolean
  file?: FileMetadata
  error?: string
}

export interface FileUploadState {
  status: UploadStatus
  progress: number
  error: string | null
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

// =============================================================================
// FIRESTORE TYPES
// =============================================================================

export interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
  toDate(): Date
}

export interface FirestoreMessage {
  id: string
  content: string
  role: UserRole
  timestamp: Timestamp | null
  userId?: string
  sessionId?: string
  type?: MessageType
  fileId?: string
  metadata?: Record<string, any>
}

export interface FirestoreChatSession {
  id: string
  title: string
  userId: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  messageCount: number
  lastMessage?: string
  isActive: boolean
  metadata?: Record<string, any>
}

export interface FirestoreFile {
  id: string
  name: string
  size: number
  type: string
  category: FileCategory
  url: string
  downloadUrl?: string
  thumbnailUrl?: string
  userId: string
  uploadedAt: Timestamp | null
  path: string
  metadata?: Record<string, any>
}

// =============================================================================
// ROADMAP & PROJECT TYPES
// =============================================================================

export interface RoadmapPhase {
  id: number
  title: string
  description: string
  status: PhaseStatus
  techStack: string[]
  features: string[]
  estimatedDays: number
  actualDays?: number
  icon: string
  startDate?: Date
  endDate?: Date
  completionPercentage?: number
}

export interface ProjectStats {
  totalPhases: number
  completedPhases: number
  inProgressPhases: number
  totalEstimatedDays: number
  totalActualDays: number
  overallProgress: number
  efficiency: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate: Date
  completed: boolean
  phaseId: number
}

// =============================================================================
// UI & COMPONENT TYPES
// =============================================================================

export interface LoadingState {
  isLoading: boolean
  message?: string
}

export interface ErrorState {
  hasError: boolean
  error: string | null
  code?: string
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
}

export interface FilterConfig<T> {
  field: keyof T
  value: any
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface UseChatReturn {
  messages: ChatMessage[]
  sendTextMessage: (content: string) => Promise<void>
  sendFileMessage: (file: FileMetadata, content?: string) => Promise<void>
  loading: boolean
  error: string | null
  clearError: () => void
}

export interface UseFileUploadReturn {
  uploadSingleFile: (file: File) => Promise<FileUploadResult>
  uploadMultipleFiles: (files: File[]) => Promise<FileUploadResult[]>
  uploadStatus: FileUploadState
  resetUpload: () => void
}

export interface UseErrorHandlerReturn {
  error: string | null
  setError: (error: string | Error | null) => void
  clearError: () => void
  handleError: (error: string | Error) => void
}

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

// =============================================================================
// API & SERVICE TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  timestamp: Date
}

export interface ServiceConfig {
  timeout: number
  retries: number
  baseUrl?: string
}

export interface QwenApiResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// =============================================================================
// FORM & VALIDATION TYPES
// =============================================================================

export interface FormField<T = any> {
  name: string
  value: T
  error?: string
  touched: boolean
  required: boolean
}

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean | string
  message: string
}

export interface FormState<T extends Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Generic event handler types
export type EventHandler<T = any> = (event: T) => void
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>

// Component prop types
export type PropsWithClassName<T = {}> = T & {
  className?: string
}

export type PropsWithChildren<T = {}> = T & {
  children?: React.ReactNode
}

// =============================================================================
// CONSTANTS & ENUMS
// =============================================================================

export const FILE_CATEGORIES = {
  IMAGE: 'image',
  DOCUMENT: 'document', 
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  OTHER: 'other'
} as const

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const

export const PHASE_STATUSES = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  PAUSED: 'paused'
} as const

export const UPLOAD_STATUSES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// =============================================================================
// TYPE GUARDS
// =============================================================================

export const isTextMessage = (message: ChatMessage): message is TextMessage => {
  return message.type === 'text'
}

export const isFileMessage = (message: ChatMessage): message is FileMessage => {
  return message.type === 'file' && 'file' in message
}

export const isSystemMessage = (message: ChatMessage): message is SystemMessage => {
  return message.type === 'system'
}

export const isFirestoreTimestamp = (value: any): value is Timestamp => {
  return value && typeof value.toDate === 'function'
}

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}
