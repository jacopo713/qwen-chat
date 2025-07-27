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
}

export interface FileMessage {
  id: string
  type: 'file'
  content: string
  file: FileMetadata
  timestamp: Date
  userId: string
}

export interface UploadStatus {
  isUploading: boolean
  progress: number
  error: string | null
}

export interface FileUploadResult {
  success: boolean
  file?: FileMetadata
  error?: string
}

export type SupportedFileType = 
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain'
  | 'text/csv'
  | 'application/json'

export interface FilePreview {
  file: File
  preview: string
  id: string
}
