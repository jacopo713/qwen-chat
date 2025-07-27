'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { ChatState, Message, ChatSession } from '@/types/chat'
import { FileMetadata } from '@/types/file'

// Initial state
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isLoading: false,
  error: null
}

// Action types
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession | null }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string; isLoading?: boolean } }
  | { type: 'ADD_ATTACHED_FILE'; payload: FileMetadata }
  | { type: 'REMOVE_ATTACHED_FILE'; payload: string }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'CLEAR_ERROR' }

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload }
    
    case 'ADD_MESSAGE':
      if (!state.currentSession) {
        // Create new session if none exists
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: action.payload.content.slice(0, 50) + '...',
          messages: [action.payload],
          attachedFiles: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
        return {
          ...state,
          currentSession: newSession,
          sessions: [newSession, ...state.sessions]
        }
      } else {
        // Add to existing session
        const updatedSession = {
          ...state.currentSession,
          messages: [...state.currentSession.messages, action.payload],
          updatedAt: new Date()
        }
        return {
          ...state,
          currentSession: updatedSession,
          sessions: state.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          )
        }
      }
    
    case 'UPDATE_MESSAGE':
      if (!state.currentSession) return state
      
      const updatedSession = {
        ...state.currentSession,
        messages: state.currentSession.messages.map(msg =>
          msg.id === action.payload.id 
            ? { 
                ...msg, 
                content: action.payload.content, 
                isLoading: action.payload.isLoading ?? false 
              }
            : msg
        )
      }
      
      return {
        ...state,
        currentSession: updatedSession,
        sessions: state.sessions.map(s => 
          s.id === updatedSession.id ? updatedSession : s
        )
      }

    case 'ADD_ATTACHED_FILE':
      if (!state.currentSession) {
        // Create new session with attached file
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: `Files: ${action.payload.name}`,
          messages: [],
          attachedFiles: [action.payload],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
        return {
          ...state,
          currentSession: newSession,
          sessions: [newSession, ...state.sessions]
        }
      } else {
        // Add file to existing session
        const updatedSession = {
          ...state.currentSession,
          attachedFiles: [...state.currentSession.attachedFiles, action.payload],
          updatedAt: new Date()
        }
        return {
          ...state,
          currentSession: updatedSession,
          sessions: state.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          )
        }
      }

    case 'REMOVE_ATTACHED_FILE':
      if (!state.currentSession) return state
      
      const sessionWithRemovedFile = {
        ...state.currentSession,
        attachedFiles: state.currentSession.attachedFiles.filter(
          file => file.id !== action.payload
        ),
        updatedAt: new Date()
      }
      
      return {
        ...state,
        currentSession: sessionWithRemovedFile,
        sessions: state.sessions.map(s => 
          s.id === sessionWithRemovedFile.id ? sessionWithRemovedFile : s
        )
      }
    
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

// Context interface
interface ChatContextType extends ChatState {
  sendMessage: (content: string) => Promise<void>
  addAttachedFile: (file: FileMetadata) => void
  removeAttachedFile: (fileId: string) => void
  clearError: () => void
  createNewSession: () => void
  selectSession: (sessionId: string) => void
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const sendMessage = useCallback(async (content: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        role: 'user',
        timestamp: new Date()
      }

      // Add user message
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

      // Create assistant message placeholder
      const assistantMessageId = crypto.randomUUID()
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isLoading: true
      }

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage })

      // Prepare request with attached files as context
      const requestBody = {
        message: content,
        attachedFiles: state.currentSession?.attachedFiles || []
      }

      // Call API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      let assistantContent = ''
      const decoder = new TextDecoder()

      // Read stream and update message content
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantContent += parsed.content
                
                // Update the loading message with streaming content
                dispatch({ 
                  type: 'UPDATE_MESSAGE', 
                  payload: { 
                    id: assistantMessageId, 
                    content: assistantContent,
                    isLoading: true
                  } 
                })
              }
            } catch (e) {
              // Skip invalid JSON
              continue
            }
          }
        }
      }

      // Final update to mark as complete
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { 
          id: assistantMessageId, 
          content: assistantContent || 'Sorry, I encountered an error.',
          isLoading: false
        } 
      })

    } catch (error) {
      console.error('Error sending message:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to send message' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.currentSession])

  const addAttachedFile = useCallback((file: FileMetadata) => {
    dispatch({ type: 'ADD_ATTACHED_FILE', payload: file })
  }, [])

  const removeAttachedFile = useCallback((fileId: string) => {
    dispatch({ type: 'REMOVE_ATTACHED_FILE', payload: fileId })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const createNewSession = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: null })
  }, [])

  const selectSession = useCallback((sessionId: string) => {
    const session = state.sessions.find(s => s.id === sessionId)
    if (session) {
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session })
    }
  }, [state.sessions])

  const value: ChatContextType = {
    ...state,
    sendMessage,
    addAttachedFile,
    removeAttachedFile,
    clearError,
    createNewSession,
    selectSession
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook to use chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
