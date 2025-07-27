'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatArea from '@/components/chat/ChatArea'
import ChatInput from '@/components/chat/ChatInput'
import FileUpload from '@/components/FileUpload'
import { FileMetadata } from '@/types/file'
import { getFileIcon } from '@/lib/firebase'

export default function ChatPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { 
    currentSession, 
    sendMessage, 
    addAttachedFile,
    removeAttachedFile,
    isLoading, 
    error, 
    clearError 
  } = useChat()

  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const attachedFiles = currentSession?.attachedFiles || []
  const userMessageCount = currentSession?.messages.filter(msg => msg.role === 'user').length || 0
  const isWelcomeState = userMessageCount === 0 && attachedFiles.length === 0

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

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

  const handleAttachFile = () => {
    setShowFileUpload(!showFileUpload)
    setUploadError(null)
  }

  const handleFileUploaded = async (file: FileMetadata) => {
    try {
      addAttachedFile(file)
      setShowFileUpload(false)
      setUploadError(null)
    } catch (error) {
      console.error('Failed to attach file:', error)
      setUploadError('Failed to attach file')
    }
  }

  const handleFileUploadError = (error: string) => {
    setUploadError(error)
    setTimeout(() => setUploadError(null), 5000)
  }

  const renderAttachedFiles = () => {
    if (attachedFiles.length === 0) return null

    return (
      <div className="bg-blue-50 border-t border-blue-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Attached Files ({attachedFiles.length}) - Click file name to remove
            </h3>
          </div>
          
          <div className="grid gap-2">
            {attachedFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 bg-white border border-blue-200 rounded-lg">
                <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-sm">{getFileIcon(file.type)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => removeAttachedFile(file.id)}
                    className="text-sm font-medium text-blue-700 hover:text-blue-900 truncate block w-full text-left"
                  >
                    {file.name}
                  </button>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
            Context Active: These files are available to the AI for analysis and questions.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <ChatSidebar />
      
      <div className="flex-1 flex flex-col bg-white">
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
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
              <div className="pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={clearError}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {isWelcomeState ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full">
              <div className="text-center space-y-6 mb-8">
                <div className="text-gray-900 text-2xl font-semibold leading-10">
                  What can I help with?
                </div>
                <div className="text-gray-600 text-sm leading-6">
                  How can I help you today?
                </div>
              </div>
              
              {showFileUpload && (
                <div className="w-full max-w-md mb-6">
                  <FileUpload
                    onFileUploaded={handleFileUploaded}
                    onError={handleFileUploadError}
                    multiple={false}
                    className="w-full"
                  />
                </div>
              )}
              
              <ChatInput
                onSendMessage={handleSendMessage}
                onAttachFile={handleAttachFile}
                isLoading={isLoading}
                placeholder="Ask me anything about coding..."
              />
            </div>
          </div>
        ) : (
          <>
            <ChatArea 
              session={currentSession} 
              isLoading={isLoading}
              error={null}
            />

            {renderAttachedFiles()}

            {showFileUpload && (
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  onError={handleFileUploadError}
                  multiple={true}
                  className="max-w-md mx-auto"
                />
              </div>
            )}

            <div className="bg-white pt-2 pb-3 flex-shrink-0">
              <ChatInput 
                onSendMessage={handleSendMessage}
                onAttachFile={handleAttachFile}
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
