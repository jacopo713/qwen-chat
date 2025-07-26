'use client'

import React from 'react'
import Link from 'next/link'
import { useRoadmapData } from '@/hooks/useRoadmapData'
import RoadmapCard from '@/components/ui/RoadmapCard'

export default function HomePage() {
  const { phases, stats } = useRoadmapData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Qwen Chat
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Intelligent AI chat application with advanced memory capabilities, 
            secure authentication, and seamless file sharing. Built with modern 
            technologies for the best user experience.
          </p>
          
          {/* Project Stats */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.completedPhases}/{stats.totalPhases}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Phases Complete
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {Math.round(stats.progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Overall Progress
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                Phase {stats.currentPhase}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Current Focus
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Development Progress
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Try Chat Interface
            </Link>
            <button 
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
              onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
              </svg>
              View Roadmap
            </button>
          </div>
        </div>

        {/* Development Roadmap */}
        <div id="roadmap" className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
            Development Roadmap
          </h2>
          
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {phases.map((phase) => (
              <RoadmapCard 
                key={phase.id} 
                phase={phase}
                isActive={phase.status === 'in-progress'}
              />
            ))}
          </div>
        </div>

        {/* Technology Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Technology Stack Overview
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⚛️</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Frontend
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                React, Next.js, TypeScript, Tailwind CSS
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Backend & Auth
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Firebase, Firestore, Cloud Storage
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                AI & Memory
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Qwen API, Pinecone, Cohere
              </p>
            </div>
          </div>
        </div>

        {/* Phase 1 Status */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Phase 1 Complete: Chat Frontend Ready
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Ready for Qwen API integration in the next phase
          </p>
        </div>
      </div>
    </div>
  )
}
