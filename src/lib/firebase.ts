import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  getFirestore, 
  connectFirestoreEmulator,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  QuerySnapshot,
  DocumentSnapshot,
  writeBatch
} from 'firebase/firestore'
import { 
  getStorage, 
  connectStorageEmulator,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask
} from 'firebase/storage'

import { 
  timestampToDate, 
  dateToTimestamp, 
  validateFile, 
  generateId,
  getFileIcon,
  formatFileSize 
} from './utils'
import {
  User,
  ChatSession,
  ChatMessage,
  FileMetadata,
  FirestoreChatSession,
  FirestoreMessage,
  FirestoreFile,
  CreateChatSessionInput,
  UpdateChatSessionInput,
  ChatSessionFilters,
  ChatSessionsResult,
  FileUploadResult,
  FileCategory,
  ApiResponse
} from '@/types'

// =============================================================================
// FIREBASE CONFIGURATION
// =============================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Development emulators
if (process.env.NODE_ENV === 'development') {
  const isEmulatorConnected = {
    auth: false,
    firestore: false,
    storage: false
  }

  if (!isEmulatorConnected.auth) {
    connectAuthEmulator(auth, 'http://localhost:9099')
    isEmulatorConnected.auth = true
  }

  if (!isEmulatorConnected.firestore) {
    connectFirestoreEmulator(db, 'localhost', 8080)
    isEmulatorConnected.firestore = true
  }

  if (!isEmulatorConnected.storage) {
    connectStorageEmulator(storage, 'localhost', 9199)
    isEmulatorConnected.storage = true
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const COLLECTIONS = {
  CHATS: 'chats',
  MESSAGES: 'messages',
  FILES: 'files',
  USERS: 'users'
} as const

export const STORAGE_PATHS = {
  CHAT_FILES: 'chat-files',
  USER_UPLOADS: 'user-uploads',
  THUMBNAILS: 'thumbnails'
} as const

export const ALLOWED_FILE_TYPES = [
  'image/*',
  'application/pdf',
  'text/*',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export const MAX_FILE_SIZE_MB = 10

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getFileCategory = (file: File): FileCategory => {
  const type = file.type.toLowerCase()
  
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document'
  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'archive'
  
  return 'other'
}

const createStoragePath = (userId: string, filename: string): string => {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const timestamp = Date.now()
  return `${STORAGE_PATHS.CHAT_FILES}/${userId}/${timestamp}_${sanitizedFilename}`
}

// =============================================================================
// CONVERSION FUNCTIONS
// =============================================================================

export const convertFirestoreUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
  createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
  lastLoginAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : new Date()
})

export const convertFirestoreMessage = (doc: DocumentSnapshot): ChatMessage | null => {
  if (!doc.exists()) return null
  
  const data = doc.data() as FirestoreMessage
  const baseMessage = {
    id: doc.id,
    content: data.content || '',
    role: data.role || 'user',
    timestamp: timestampToDate(data.timestamp),
    userId: data.userId,
    sessionId: data.sessionId
  }

  if (data.type === 'file' && data.fileId) {
    return {
      ...baseMessage,
      type: 'file',
      file: {} as FileMetadata // Will be populated separately
    }
  }

  if (data.type === 'system') {
    return {
      ...baseMessage,
      type: 'system',
      role: 'system'
    }
  }

  return {
    ...baseMessage,
    type: 'text'
  }
}

export const convertFirestoreChatSession = (doc: DocumentSnapshot): ChatSession | null => {
  if (!doc.exists()) return null
  
  const data = doc.data() as FirestoreChatSession
  
  return {
    id: doc.id,
    title: data.title || 'Chat senza titolo',
    userId: data.userId,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    messageCount: data.messageCount || 0,
    lastMessage: data.lastMessage,
    isActive: data.isActive ?? true,
    metadata: data.metadata
  }
}

export const convertFirestoreFile = (doc: DocumentSnapshot): FileMetadata | null => {
  if (!doc.exists()) return null
  
  const data = doc.data() as FirestoreFile
  
  return {
    id: doc.id,
    name: data.name,
    size: data.size,
    type: data.type,
    category: data.category,
    url: data.url,
    downloadUrl: data.downloadUrl,
    thumbnailUrl: data.thumbnailUrl,
    userId: data.userId,
    uploadedAt: timestampToDate(data.uploadedAt),
    path: data.path,
    metadata: data.metadata
  }
}

// =============================================================================
// AUTHENTICATION SERVICES
// =============================================================================

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return convertFirestoreUser(userCredential.user)
  },

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    if (displayName) {
      await updateProfile(userCredential.user, { displayName })
    }
    
    return convertFirestoreUser(userCredential.user)
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email)
  },

  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, updates)
    }
  }
}

// =============================================================================
// CHAT SESSION SERVICES
// =============================================================================

export const chatSessionService = {
  async createSession(input: CreateChatSessionInput): Promise<ChatSession> {
    const sessionData: Omit<FirestoreChatSession, 'id'> = {
      title: input.title,
      userId: input.userId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      messageCount: 0,
      isActive: true,
      metadata: input.metadata
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.CHATS), sessionData)
    const doc = await getDoc(docRef)
    
    const session = convertFirestoreChatSession(doc)
    if (!session) throw new Error('Errore nella creazione della sessione')
    
    return session
  },

  async updateSession(sessionId: string, updates: UpdateChatSessionInput): Promise<void> {
    const sessionRef = doc(db, COLLECTIONS.CHATS, sessionId)
    const updateData: Partial<FirestoreChatSession> = {
      ...updates,
      updatedAt: serverTimestamp() as Timestamp
    }
    
    await updateDoc(sessionRef, updateData)
  },

  async deleteSession(sessionId: string): Promise<void> {
    const batch = writeBatch(db)
    
    // Delete session
    const sessionRef = doc(db, COLLECTIONS.CHATS, sessionId)
    batch.delete(sessionRef)
    
    // Delete all messages in the session
    const messagesRef = collection(db, COLLECTIONS.CHATS, sessionId, COLLECTIONS.MESSAGES)
    const messagesSnapshot = await getDocs(messagesRef)
    
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
  },

  async getSessions(filters: ChatSessionFilters = {}): Promise<ChatSessionsResult> {
    let q = query(collection(db, COLLECTIONS.CHATS))
    
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId))
    }
    
    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive))
    }
    
    if (filters.startDate) {
      q = query(q, where('createdAt', '>=', dateToTimestamp(filters.startDate)))
    }
    
    if (filters.endDate) {
      q = query(q, where('createdAt', '<=', dateToTimestamp(filters.endDate)))
    }
    
    q = query(q, orderBy('updatedAt', 'desc'))
    
    if (filters.limit) {
      q = query(q, limit(filters.limit))
    }
    
    const snapshot = await getDocs(q)
    const sessions = snapshot.docs
      .map(convertFirestoreChatSession)
      .filter((session): session is ChatSession => session !== null)
    
    return {
      sessions,
      total: sessions.length,
      hasMore: false // Simplified for now
    }
  },

  subscribeToSessions(
    filters: ChatSessionFilters,
    callback: (sessions: ChatSession[]) => void
  ): () => void {
    let q = query(collection(db, COLLECTIONS.CHATS))
    
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId))
    }
    
    q = query(q, orderBy('updatedAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs
        .map(convertFirestoreChatSession)
        .filter((session): session is ChatSession => session !== null)
      
      callback(sessions)
    })
  }
}

// =============================================================================
// MESSAGE SERVICES
// =============================================================================

export const messageService = {
  async sendTextMessage(sessionId: string, content: string, userId: string): Promise<ChatMessage> {
    const messageData: Omit<FirestoreMessage, 'id'> = {
      content,
      role: 'user',
      type: 'text',
      timestamp: serverTimestamp() as Timestamp,
      userId,
      sessionId
    }

    const docRef = await addDoc(
      collection(db, COLLECTIONS.CHATS, sessionId, COLLECTIONS.MESSAGES),
      messageData
    )
    
    // Update session message count
    const sessionRef = doc(db, COLLECTIONS.CHATS, sessionId)
    await updateDoc(sessionRef, {
      messageCount: await this.getMessageCount(sessionId),
      lastMessage: content.substring(0, 100),
      updatedAt: serverTimestamp()
    })

    const messageDoc = await getDoc(docRef)
    const message = convertFirestoreMessage(messageDoc)
    if (!message) throw new Error('Errore nell\'invio del messaggio')
    
    return message
  },

  async sendFileMessage(
    sessionId: string, 
    file: FileMetadata, 
    content: string = '', 
    userId: string
  ): Promise<ChatMessage> {
    const messageData: Omit<FirestoreMessage, 'id'> = {
      content: content || `File inviato: ${file.name}`,
      role: 'user',
      type: 'file',
      timestamp: serverTimestamp() as Timestamp,
      userId,
      sessionId,
      fileId: file.id
    }

    const docRef = await addDoc(
      collection(db, COLLECTIONS.CHATS, sessionId, COLLECTIONS.MESSAGES),
      messageData
    )
    
    // Update session
    const sessionRef = doc(db, COLLECTIONS.CHATS, sessionId)
    await updateDoc(sessionRef, {
      messageCount: await this.getMessageCount(sessionId),
      lastMessage: `📎 ${file.name}`,
      updatedAt: serverTimestamp()
    })

    const messageDoc = await getDoc(docRef)
    const message = convertFirestoreMessage(messageDoc)
    if (!message) throw new Error('Errore nell\'invio del file')
    
    return {
      ...message,
      type: 'file',
      file
    }
  },

  async getMessageCount(sessionId: string): Promise<number> {
    const messagesRef = collection(db, COLLECTIONS.CHATS, sessionId, COLLECTIONS.MESSAGES)
    const snapshot = await getDocs(messagesRef)
    return snapshot.size
  },

  subscribeToMessages(
    sessionId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const messagesRef = collection(db, COLLECTIONS.CHATS, sessionId, COLLECTIONS.MESSAGES)
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    return onSnapshot(q, async (snapshot) => {
      const messages: ChatMessage[] = []
      
      for (const doc of snapshot.docs) {
        const message = convertFirestoreMessage(doc)
        if (message) {
          // If it's a file message, fetch file metadata
          if (message.type === 'file' && 'fileId' in doc.data()) {
            const fileData = await fileService.getFile(doc.data().fileId)
            if (fileData) {
              messages.push({
                ...message,
                file: fileData
              })
            }
          } else {
            messages.push(message)
          }
        }
      }
      
      callback(messages)
    })
  }
}

// =============================================================================
// FILE SERVICES
// =============================================================================

export const fileService = {
  async uploadFile(file: File, userId: string): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = validateFile(file)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Create storage path
      const storagePath = createStoragePath(userId, file.name)
      const storageRef = ref(storage, storagePath)

      // Upload file
      const snapshot = await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(snapshot.ref)

      // Create file metadata
      const fileMetadata: Omit<FileMetadata, 'id'> = {
        name: file.name,
        size: file.size,
        type: file.type,
        category: getFileCategory(file),
        url: downloadUrl,
        downloadUrl,
        userId,
        uploadedAt: new Date(),
        path: storagePath,
        metadata: {
          originalName: file.name,
          lastModified: file.lastModified
        }
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, COLLECTIONS.FILES), {
        ...fileMetadata,
        uploadedAt: serverTimestamp()
      })

      const fileDoc = await getDoc(docRef)
      const savedFile = convertFirestoreFile(fileDoc)
      
      if (!savedFile) {
        throw new Error('Errore nel salvataggio del file')
      }

      return {
        success: true,
        file: savedFile
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore nell\'upload del file'
      }
    }
  },

  async uploadFileWithProgress(
    file: File, 
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      const validation = validateFile(file)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      const storagePath = createStoragePath(userId, file.name)
      const storageRef = ref(storage, storagePath)

      return new Promise((resolve) => {
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress?.(progress)
          },
          (error) => {
            resolve({
              success: false,
              error: error.message
            })
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)

              const fileMetadata: Omit<FileMetadata, 'id'> = {
                name: file.name,
                size: file.size,
                type: file.type,
                category: getFileCategory(file),
                url: downloadUrl,
                downloadUrl,
                userId,
                uploadedAt: new Date(),
                path: storagePath
              }

              const docRef = await addDoc(collection(db, COLLECTIONS.FILES), {
                ...fileMetadata,
                uploadedAt: serverTimestamp()
              })

              const fileDoc = await getDoc(docRef)
              const savedFile = convertFirestoreFile(fileDoc)

              resolve({
                success: true,
                file: savedFile || undefined
              })
            } catch (error) {
              resolve({
                success: false,
                error: error instanceof Error ? error.message : 'Errore nell\'upload'
              })
            }
          }
        )
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore nell\'upload del file'
      }
    }
  },

  async getFile(fileId: string): Promise<FileMetadata | null> {
    const fileDoc = await getDoc(doc(db, COLLECTIONS.FILES, fileId))
    return convertFirestoreFile(fileDoc)
  },

  async deleteFile(fileId: string): Promise<void> {
    const fileDoc = await getDoc(doc(db, COLLECTIONS.FILES, fileId))
    const fileData = convertFirestoreFile(fileDoc)
    
    if (fileData) {
      // Delete from storage
      const storageRef = ref(storage, fileData.path)
      await deleteObject(storageRef)
      
      // Delete from Firestore
      await deleteDoc(doc(db, COLLECTIONS.FILES, fileId))
    }
  },

  async getUserFiles(userId: string): Promise<FileMetadata[]> {
    const q = query(
      collection(db, COLLECTIONS.FILES),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map(convertFirestoreFile)
      .filter((file): file is FileMetadata => file !== null)
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default app

// Re-export commonly used utilities from utils
export { 
  validateFile,
  getFileIcon,
  formatFileSize,
  timestampToDate,
  dateToTimestamp
}
