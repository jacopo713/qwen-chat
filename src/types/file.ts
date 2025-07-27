// Base file metadata interface
export interface FileMetadata {
  id: string
  name: string
  originalName: string
  type: string
  size: number
  url: string
  uploadedAt: Date
  uploadedBy: string
  storagePath: string
  description?: string
  tags?: string[]
}

// File preview interface for upload UI
export interface FilePreview {
  file: File
  preview?: string
  id: string
  error?: string
}

// Upload status for tracking progress
export interface UploadStatus {
  isUploading: boolean
  progress: number
  error: string | null
}

// Result of file upload operation
export interface FileUploadResult {
  success: boolean
  file?: FileMetadata
  error?: string
}

// Validation result
export interface FileValidationResult {
  isValid: boolean
  error?: string
}

// File upload configuration
export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
  maxFiles?: number
}

// File display props
export interface FileDisplayProps {
  file: FileMetadata
  showPreview?: boolean
  showMetadata?: boolean
  onDelete?: (fileId: string) => void
  className?: string
}

// Supported file types enum
export enum SupportedFileType {
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_PNG = 'image/png',
  IMAGE_GIF = 'image/gif',
  IMAGE_WEBP = 'image/webp',
  PDF = 'application/pdf',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TXT = 'text/plain',
  CSV = 'text/csv',
  JSON = 'application/json'
}

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB for images
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024 // 10MB for documents
} as const

// Default upload configuration
export const DEFAULT_UPLOAD_CONFIG: FileUploadConfig = {
  maxSize: FILE_SIZE_LIMITS.MAX_FILE_SIZE,
  allowedTypes: Object.values(SupportedFileType),
  maxFiles: 5
}
