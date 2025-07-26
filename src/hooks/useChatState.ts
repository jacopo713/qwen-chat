import { useState, useCallback } from 'react'
import { Message, ChatSession, ChatState } from '@/types/chat'

// Initial welcome session
const welcomeSession: ChatSession = {
  id: '1',
  title: 'Welcome to Qwen Chat',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  messages: [
    {
      id: '1',
      content: 'Hello! I\'m Qwen Coder Plus, your AI coding assistant. I can help you with programming questions, code reviews, debugging, and much more. How can I assist you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]
}

export function useChatState() {
  const [state, setState] = useState<ChatState>({
    currentSession: welcomeSession,
    sessions: [welcomeSession],
    isLoading: false,
    error: null
  })

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    }

    // Add user message and start loading
    setState(prev => {
      if (!prev.currentSession) return prev
      
      const updatedSession = {
        ...prev.currentSession,
        messages: [...prev.currentSession.messages, userMessage],
        updatedAt: new Date()
      }

      return {
        ...prev,
        currentSession: updatedSession,
        sessions: prev.sessions.map(s => 
          s.id === updatedSession.id ? updatedSession : s
        ),
        isLoading: true,
        error: null
      }
    })

    try {
      // Prepare messages for API
      const currentSession = state.currentSession
      if (!currentSession) return

      const allMessages = [...currentSession.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Call streaming API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      // Create assistant message for streaming
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date()
      }

      // Add assistant message placeholder
      setState(prev => {
        if (!prev.currentSession) return prev
        
        const updatedSession = {
          ...prev.currentSession,
          messages: [...prev.currentSession.messages, assistantMessage],
          updatedAt: new Date()
        }

        return {
          ...prev,
          currentSession: updatedSession,
          sessions: prev.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          )
        }
      })

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream available')
      }

      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          setState(prev => ({ ...prev, isLoading: false }))
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            try {
              const data = line.slice(6)
              const parsed = JSON.parse(data)
              
              if (parsed.content) {
                accumulatedContent += parsed.content

                // Update assistant message with accumulated content
                setState(prev => {
                  if (!prev.currentSession) return prev
                  
                  const updatedMessages = prev.currentSession.messages.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )

                  const updatedSession = {
                    ...prev.currentSession,
                    messages: updatedMessages,
                    updatedAt: new Date()
                  }

                  return {
                    ...prev,
                    currentSession: updatedSession,
                    sessions: prev.sessions.map(s => 
                      s.id === updatedSession.id ? updatedSession : s
                    )
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

    } catch (error) {
      console.error('Error sending message:', error)
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }))

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }

      setState(prev => {
        if (!prev.currentSession) return prev
        
        const updatedSession = {
          ...prev.currentSession,
          messages: [...prev.currentSession.messages, errorMessage],
          updatedAt: new Date()
        }

        return {
          ...prev,
          currentSession: updatedSession,
          sessions: prev.sessions.map(s => 
            s.id === updatedSession.id ? updatedSession : s
          )
        }
      })
    }
  }, [state.isLoading, state.currentSession])

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      messages: [{
        id: Date.now().toString(),
        content: 'Hello! I\'m Qwen Coder Plus, ready to help you with your coding tasks. What would you like to work on?',
        role: 'assistant',
        timestamp: new Date()
      }]
    }

    setState(prev => ({
      ...prev,
      currentSession: newSession,
      sessions: [newSession, ...prev.sessions.map(s => ({ ...s, isActive: false }))],
      error: null
    }))
  }, [])

  const switchSession = useCallback((sessionId: string) => {
    setState(prev => {
      const targetSession = prev.sessions.find(s => s.id === sessionId)
      if (!targetSession) return prev

      return {
        ...prev,
        currentSession: targetSession,
        sessions: prev.sessions.map(s => ({
          ...s,
          isActive: s.id === sessionId
        })),
        error: null
      }
    })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    sendMessage,
    createNewSession,
    switchSession,
    clearError
  }
}
