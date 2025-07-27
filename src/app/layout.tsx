import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Qwen Chat - AI-Powered Conversations',
  description: 'Intelligent AI chat application with advanced memory capabilities, secure authentication, and seamless file sharing.',
  keywords: ['AI', 'Chat', 'Qwen', 'Firebase', 'Next.js', 'TypeScript'],
  authors: [{ name: 'Qwen Chat Team' }],
  openGraph: {
    title: 'Qwen Chat - AI-Powered Conversations',
    description: 'Intelligent AI chat application with advanced memory capabilities.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
