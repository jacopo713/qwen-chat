'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, loading } = useAuth()

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              Q
            </div>
            Qwen Chat
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/chat"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Open Chat
                    </Link>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600 max-w-32 truncate">
                        {user.email}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/login"
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/register"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
