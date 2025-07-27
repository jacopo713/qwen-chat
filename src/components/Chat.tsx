import React, { useState, useRef, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { useChat } from '@/hooks/useChat'
import { FileMetadata } from '@/types/file'
import FileUpload from './FileUpload'
import FileMessage from './FileMessage'

export default function Chat() {
  const [user] = useAuthState(auth)
  const { messages, sendTextMessage, sendFileMessage, loading, error } = useChat()
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Please log in to use chat</div>
      </div>
    )
  }

  return (
    <div className="chat-container flex flex-col h-96 bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-900">Chat</h3>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
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
          messages.map((message) => {
            const isOwn = message.userId === user.uid

            if (message.type === 'file') {
              return (
                <FileMessage
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                />
              )
            }

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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File upload area */}
      {showFileUpload && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Carica File</h4>
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <FileUpload
            onFileUploaded={handleFileUploaded}
            onError={handleFileUploadError}
          />
        </div>
      )}

      {/* Error display */}
      {uploadError && (
        <div className="mx-4 mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {/* Input area - QUI È IL PROBLEMA */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage}>
          {/* Textarea per il messaggio */}
          <div className="flex space-x-2 mb-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi un messaggio..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          {/* Riga con bottoni */}
          <div className="flex justify-between items-center">
            {/* BOTTONE FILE - ORA MOLTO VISIBILE */}
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={`
                px-4 py-2 rounded-lg border-2 font-medium transition-all
                ${showFileUpload 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                }
              `}
            >
              📎 Carica File
            </button>
            
            {/* BOTTONE SEND */}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Invia
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
