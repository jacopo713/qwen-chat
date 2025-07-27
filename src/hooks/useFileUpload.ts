import { useState, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, uploadFile, generateFilePath, validateFile } from '@/lib/firebase'
import { FileMetadata, UploadStatus, FileUploadResult } from '@/types/file'

export const useFileUpload = () => {
  const [user] = useAuthState(auth)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    error: null
  })

  const uploadSingleFile = useCallback(async (file: File): Promise<FileUploadResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    setUploadStatus({ isUploading: true, progress: 0, error: null })

    try {
      const storagePath = generateFilePath(user.uid, file.name)
      
      const downloadURL = await uploadFile(file, storagePath, (progress) => {
        setUploadStatus(prev => ({ ...prev, progress }))
      })

      const fileMetadata: FileMetadata = {
        id: crypto.randomUUID(),
        name: file.name,
        originalName: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        uploadedAt: new Date(),
        uploadedBy: user.uid,
        storagePath
      }

      setUploadStatus({ isUploading: false, progress: 100, error: null })
      
      return { success: true, file: fileMetadata }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadStatus({ isUploading: false, progress: 0, error: errorMessage })
      
      return { success: false, error: errorMessage }
    }
  }, [user])

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<FileUploadResult[]> => {
    const results: FileUploadResult[] = []
    
    for (const file of files) {
      const result = await uploadSingleFile(file)
      results.push(result)
    }
    
    return results
  }, [uploadSingleFile])

  const resetUploadStatus = useCallback(() => {
    setUploadStatus({ isUploading: false, progress: 0, error: null })
  }, [])

  return {
    uploadSingleFile,
    uploadMultipleFiles,
    uploadStatus,
    resetUploadStatus
  }
}
