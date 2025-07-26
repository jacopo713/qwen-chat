// Global type definitions for qwen-chat application

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
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type Theme = 'light' | 'dark' | 'system'

export interface AppConfig {
  theme: Theme
  language: string
  autoSave: boolean
}
