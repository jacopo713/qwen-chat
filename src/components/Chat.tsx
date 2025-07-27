import React, { useState, useRef, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { useChat } from '@/hooks/useChat'
import { FileMetadata } from '@/types/file'
import { ChatMessage } from '@/types/chat'
import FileUpload from './FileUpload'
import FileMessage from './FileMessage'
import FileDisplay from './FileDisplay'

export default function Chat() {
  const [user] = useAuthState(auth)
  const { messages, sendTextMessage, sendFileMessage, loading, error, clearError } = useChat()
  const [inputValue, setInputValue] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Clear errors when component mounts
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // Handle text message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || !user) return

    try {
      await sendTextMessage(inputValue)
      setInputValue('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle file upload
  const handleFileUploaded = async (file: FileMetadata) => {
    try {
      await sendFileMessage(file, inputValue.trim())
      setInputValue('')
      setShowFileUpload(false)
      setUploadError(null)
    } catch (error) {
      console.error('Failed to send file message:', error)
    }
  }

  // Handle file upload error
  const handleFileUploadError = (error: string) => {
    setUploadError(error)
    setTimeout(() => setUploadError(null), 5000)
  }

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // Handle attach file button
  const handleAttachFile = () => {
    setShowFileUpload(!showFileUpload)
    setUploadError(null)
  }

  // Render individual message
  const renderMessage = (message: ChatMessage) => {
    const isOwn = message.userId === user?.uid

    if (message.type === 'file') {
      return (
        <FileMessage
          key={message.id}
          message={message}
          isOwn={isOwn}
        />
      )
    }

    // Text message
    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`
            max-w-md p-3 rounded-lg
            ${isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-900'
            }
          `}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div 
            className={`
              text-xs mt-1
              ${isOwn ? 'text-blue-200' : 'text-gray-500'}
            `}
          >
            {new Intl.DateTimeFormat('it-IT', {
              hour: '2-digit',
              minute: '2-digit'
            }).format(message.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🔒</div>
          <div>Please log in to use chat</div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container flex flex-col h-96 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Chat</h3>
          <div className="flex items-center space-x-2">
            {/* Status indicator */}
            <div className={`w-2 h-2 rounded-full ${
              loading ? 'bg-yellow-400' : error ? 'bg-red-400' : 'bg-green-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {loading ? 'Connecting...' : error ? 'Error' : 'Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-sm text-gray-500">Loading messages...</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">💬</div>
              <div>No messages yet</div>
              <div className="text-sm mt-1">Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Area */}
      {showFileUpload && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onError={handleFileUploadError}
            className="mb-4"
          />
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{uploadError}</span>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          {/* Attach file button */}
          <button
            type="button"
            onClick={handleAttachFile}
            className={`
              p-2 rounded-lg transition-colors flex-shrink-0
              ${showFileUpload 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }
            `}
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={showFileUpload ? "Add a message to your file..." : "Type a message..."}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                resize: 'none'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
              }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
