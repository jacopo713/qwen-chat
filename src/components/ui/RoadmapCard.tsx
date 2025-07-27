import React from 'react'
import { RoadmapPhase } from '@/types/roadmap'
import ProgressBadge from './ProgressBadge'
import TechStack from './TechStack'

interface RoadmapCardProps {
  phase: RoadmapPhase
  isActive?: boolean
}

export default function RoadmapCard({ phase, isActive = false }: RoadmapCardProps) {
  return (
    <div
      className={`
        relative p-6 rounded-lg border transition-all duration-300 hover:shadow-lg
        ${isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md' 
          : phase.status === 'completed'
          ? 'border-green-200 bg-green-50 dark:bg-green-950 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
      `}
    >
      {/* Phase Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{phase.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Phase {phase.id}: {phase.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {phase.status === 'completed' && phase.actualDays ? (
                <>
                  ✅ Completed in <span className="font-medium text-green-600">{phase.actualDays} days</span>
                  {phase.actualDays < phase.estimatedDays && (
                    <span className="text-green-600"> ({phase.estimatedDays - phase.actualDays} days ahead!)</span>
                  )}
                </>
              ) : (
                `Estimated: ${phase.estimatedDays} days`
              )}
            </p>
          </div>
        </div>
        <ProgressBadge status={phase.status} />
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {phase.description}
      </p>

      {/* Features */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Key Features
        </h4>
        <ul className="space-y-1">
          {phase.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              {feature.startsWith('✅') ? (
                <span className="text-green-500 mt-0.5 font-bold">✅</span>
              ) : feature.startsWith('🔄') ? (
                <span className="text-blue-500 mt-0.5">🔄</span>
              ) : (
                <span className="text-gray-400 mt-0.5">•</span>
              )}
              <span className={feature.startsWith('✅') ? 'text-green-700 dark:text-green-300' : ''}>
                {feature.replace(/^[✅🔄]\s*/, '')}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack */}
      <TechStack technologies={phase.techStack} />

      {/* Status Indicators */}
      {phase.status === 'completed' && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Done
        </div>
      )}
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Current
        </div>
      )}
    </div>
  )
}
