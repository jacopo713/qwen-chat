import React, { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { FileMetadata } from '@/types'
import FileUploadArea from './FileUploadArea'
import Button from '../ui/Button'
import TextArea from '../ui/TextArea'

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>
  onSendFile: (file: FileMetadata, content?: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}

export default function MessageInput({
  onSendMessage,
  onSendFile,
  disabled = false,
  placeholder = 'Scrivi un messaggio...',
  maxLength = 2000,
  className = ''
}: MessageInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [sending, setSending] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // File upload handling
  const {
    previews,
    addFiles,
    removeFile,
    clearFiles,
    uploadSingleFile,
    error: uploadError,
    clearError: clearUploadError
  } = useFileUpload({
    multiple: false,
    autoUpload: false,
    onUploadComplete: (file) => {
      handleSendFile(file)
    }
  })

  // Handle text message send
  const handleSendMessage = useCallback(async () => {
    const content = inputValue.trim()
    if (!content || disabled || sending) return

    setSending(true)
    try {
      await onSendMessage(content)
      setInputValue('')
      textAreaRef.current?.focus()
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error)
    } finally {
      setSending(false)
    }
  }, [inputValue, disabled, sending, onSendMessage])

  // Handle file send
  const handleSendFile = useCallback(async (file: FileMetadata) => {
    const content = inputValue.trim()
    setSending(true)
    try {
      await onSendFile(file, content)
      setInputValue('')
      setShowFileUpload(false)
      clearFiles()
    } catch (error) {
      console.error('Errore nell\'invio del file:', error)
    } finally {
      setSending(false)
    }
  }, [inputValue, onSendFile, clearFiles])

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const file = fileArray[0] // Solo il primo file per semplicità
    
    try {
      setSending(true)
      const result = await uploadSingleFile(file)
      
      if (result.success && result.file) {
        await handleSendFile(result.file)
      }
    } catch (error) {
      console.error('Errore nell\'upload del file:', error)
    } finally {
      setSending(false)
    }
  }, [uploadSingleFile, handleSendFile])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    if (value.length <= maxLength) {
      setInputValue(value)
    }
  }, [maxLength])

  // Toggle file upload area
  const toggleFileUpload = useCallback(() => {
    setShowFileUpload(!showFileUpload)
    if (showFileUpload) {
      clearFiles()
      clearUploadError()
    }
  }, [showFileUpload, clearFiles, clearUploadError])

  const canSend = inputValue.trim().length > 0 && !disabled && !sending
  const characterCount = inputValue.length

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 ${className}`}>
      {/* File Upload Area */}
      {showFileUpload && (
        <div className="mb-4">
          <FileUploadArea
            onFilesSelected={handleFileUpload}
            error={uploadError}
            onErrorClear={clearUploadError}
            disabled={disabled || sending}
            previews={previews}
            onRemoveFile={removeFile}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        {/* File Upload Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFileUpload}
          disabled={disabled || sending}
          className="flex-shrink-0"
          aria-label="Allega file"
        >
          📎
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <TextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            maxRows={4}
            className="resize-none pr-12"
            autoFocus
          />
          
          {/* Character Count */}
          {characterCount > maxLength * 0.8 && (
            <div className={`absolute bottom-2 right-2 text-xs ${
              characterCount > maxLength * 0.9 
                ? 'text-red-500' 
                : 'text-yellow-500'
            }`}>
              {characterCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          loading={sending}
          className="flex-shrink-0"
          aria-label="Invia messaggio"
        >
          {sending ? '⏳' : '➤'}
        </Button>
      </div>

      {/* Input Help Text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Premi Invio per inviare, Shift+Invio per andare a capo
      </div>
    </div>
  )
}
