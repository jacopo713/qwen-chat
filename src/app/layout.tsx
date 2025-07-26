import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Qwen Chat - AI Assistant',
  description: 'Intelligent chat application powered by Qwen AI',
  keywords: ['AI', 'Chat', 'Assistant', 'Qwen'],
  authors: [{ name: 'Qwen Chat Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div id="root" className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
