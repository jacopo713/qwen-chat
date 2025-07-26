import React from 'react'

interface ProgressBadgeProps {
  status: 'planned' | 'in-progress' | 'completed'
  className?: string
}

export default function ProgressBadge({ status, className = '' }: ProgressBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          text: 'Completed',
          bgColor: 'bg-green-100 dark:bg-green-900',
          textColor: 'text-green-800 dark:text-green-200',
          icon: '✓'
        }
      case 'in-progress':
        return {
          text: 'In Progress',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          textColor: 'text-blue-800 dark:text-blue-200',
          icon: '⏳'
        }
      case 'planned':
        return {
          text: 'Planned',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: '📋'
        }
      default:
        return {
          text: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '?'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      <span className="text-xs">{config.icon}</span>
      {config.text}
    </span>
  )
}
