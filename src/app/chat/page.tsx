'use client'

import React from 'react'
import ChatLayout from '@/components/chat/ChatLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'

export default function ChatPage() {
  const { showLoginModal } = useAuth()

  return (
    <ProtectedRoute 
      redirectTo="/" 
      showLoginModal={showLoginModal}
    >
      <ChatLayout />
    </ProtectedRoute>
  )
}
