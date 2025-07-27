import React from 'react'
import { cn } from '@/lib/utils'
import Button from './Button'

interface EmptyStateProps {
  icon?: string | React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      className
    )}>
      {/* Icon */}
      <div className="mb-4">
        {typeof icon === 'string' ? (
          <span className="text-4xl">{icon}</span>
        ) : (
          icon
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Varianti pre-definite per casi comuni
export const NoMessages = ({ onStartChat }: { onStartChat?: () => void }) => (
  <EmptyState
    icon="💬"
    title="Nessun messaggio"
    description="Inizia una conversazione scrivendo il tuo primo messaggio"
    action={onStartChat ? {
      label: "Inizia Chat",
      onClick: onStartChat
    } : undefined}
  />
)

export const NoFiles = ({ onUpload }: { onUpload?: () => void }) => (
  <EmptyState
    icon="📁"
    title="Nessun file"
    description="Non hai ancora caricato nessun file"
    action={onUpload ? {
      label: "Carica File",
      onClick: onUpload
    } : undefined}
  />
)

export const NoSessions = ({ onCreateSession }: { onCreateSession?: () => void }) => (
  <EmptyState
    icon="🆕"
    title="Nessuna sessione"
    description="Crea la tua prima sessione di chat per iniziare"
    action={onCreateSession ? {
      label: "Nuova Sessione",
      onClick: onCreateSession
    } : undefined}
  />
)

export const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon="⚠️"
    title="Qualcosa è andato storto"
    description="Si è verificato un errore durante il caricamento dei dati"
    action={onRetry ? {
      label: "Riprova",
      onClick: onRetry
    } : undefined}
  />
)
