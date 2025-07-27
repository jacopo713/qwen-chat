'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatArea from '@/components/chat/ChatArea'
import ChatInput from '@/components/chat/ChatInput'

export default function ChatPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { 
    currentSession, 
    sendMessage, 
    isLoading, 
    error, 
    clearError 
  } = useChat()

  // Check if user has sent any messages (exclude initial assistant message)
  const userMessageCount = currentSession?.messages.filter(msg => msg.role === 'user').length || 0
  const isWelcomeState = userMessageCount === 0

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={clearError}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conditional Layout */}
        {isWelcomeState ? (
          /* Welcome State: Centered welcome message and input */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
            <div className="w-full max-w-4xl mx-auto">
              {/* Welcome Message */}
              <div className="text-center mb-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-white text-3xl font-bold">Q</span>
                </div>
                <div className="text-gray-900 text-2xl leading-relaxed whitespace-pre-line">
                  Hi, I'm Qwen3-Coder.{'\n'}How can I help you today?
                </div>
              </div>
              
              {/* Centered Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask me anything about coding..."
              />
            </div>
          </div>
        ) : (
          /* Conversation State: Normal layout with messages and bottom input */
          <>
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ChatArea 
                session={currentSession} 
                isLoading={isLoading}
                error={null}
              />
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 bg-white">
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Type your message..."
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
