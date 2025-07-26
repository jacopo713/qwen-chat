import { useMemo } from 'react'
import { RoadmapPhase, ProjectStats } from '@/types/roadmap'

export function useRoadmapData() {
  const phases: RoadmapPhase[] = useMemo(() => [
    {
      id: 1,
      title: 'Chat Frontend & Qwen API',
      description: 'Build the core chat interface with real-time messaging, message history, and integration with Qwen AI API for intelligent responses.',
      status: 'in-progress',
      techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Qwen API', 'WebSockets'],
      features: [
        'Real-time chat interface',
        'Message threading and history',
        'Qwen AI API integration',
        'Typing indicators',
        'Message status (sent/delivered/read)',
        'Rich text formatting support'
      ],
      estimatedDays: 7,
      icon: '💬'
    },
    {
      id: 2,
      title: 'Firebase Authentication',
      description: 'Implement secure user authentication and registration system using Firebase Auth with email/password and social login options.',
      status: 'planned',
      techStack: ['Firebase Auth', 'React Context', 'TypeScript', 'Protected Routes'],
      features: [
        'Email/password registration',
        'Social login (Google, GitHub)',
        'Password reset functionality',
        'User profile management',
        'Session management',
        'Protected route system'
      ],
      estimatedDays: 5,
      icon: '🔐'
    },
    {
      id: 3,
      title: 'Firestore Chat History',
      description: 'Persist chat conversations and user data using Firestore database with real-time synchronization across devices.',
      status: 'planned',
      techStack: ['Firestore', 'Firebase SDK', 'Real-time listeners', 'Data modeling'],
      features: [
        'Chat session persistence',
        'Cross-device synchronization',
        'Message search functionality',
        'Chat organization (folders/tags)',
        'Export chat history',
        'Offline support with sync'
      ],
      estimatedDays: 6,
      icon: '💾'
    },
    {
      id: 4,
      title: 'Firebase File Storage',
      description: 'Enable file uploads, image sharing, and document processing within chat conversations using Firebase Cloud Storage.',
      status: 'planned',
      techStack: ['Firebase Storage', 'File processing', 'Image optimization', 'Security rules'],
      features: [
        'Image and document upload',
        'File preview and download',
        'Image compression and optimization',
        'File type validation',
        'Storage quota management',
        'Secure file sharing'
      ],
      estimatedDays: 4,
      icon: '📁'
    },
    {
      id: 5,
      title: 'AI Memory with Pinecone & Cohere',
      description: 'Implement advanced AI memory system using Pinecone vector database and Cohere embeddings for contextual conversation memory.',
      status: 'planned',
      techStack: ['Pinecone', 'Cohere', 'Vector embeddings', 'RAG system', 'API integration'],
      features: [
        'Conversation context memory',
        'Semantic search across chats',
        'Personalized AI responses',
        'Knowledge base integration',
        'Topic clustering and analysis',
        'Smart conversation suggestions'
      ],
      estimatedDays: 8,
      icon: '🧠'
    }
  ], [])

  const stats: ProjectStats = useMemo(() => {
    const completedPhases = phases.filter(p => p.status === 'completed').length
    const currentPhaseIndex = phases.findIndex(p => p.status === 'in-progress')
    
    return {
      totalPhases: phases.length,
      completedPhases,
      currentPhase: currentPhaseIndex >= 0 ? currentPhaseIndex + 1 : 1,
      progressPercentage: (completedPhases / phases.length) * 100
    }
  }, [phases])

  return { phases, stats }
}
