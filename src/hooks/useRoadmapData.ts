import { useMemo } from 'react'
import { RoadmapPhase, ProjectStats } from '@/types/roadmap'

export function useRoadmapData() {
  const phases: RoadmapPhase[] = useMemo(() => [
    {
      id: 1,
      title: 'Chat Frontend & Qwen API',
      description: 'Build the core chat interface with real-time messaging, message history, and integration with Qwen AI API for intelligent responses.',
      status: 'completed', // ✅ COMPLETATO
      techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Qwen API', 'Streaming'],
      features: [
        '✅ Real-time chat interface',
        '✅ Message threading and history', 
        '✅ Qwen AI API integration',
        '✅ Streaming responses',
        '✅ Message state management',
        '✅ Responsive design',
        '✅ Loading states optimization'
      ],
      estimatedDays: 7,
      actualDays: 2, // Completato in 2 giorni
      icon: '💬'
    },
    {
      id: 2,
      title: 'Firebase Authentication',
      description: 'Implement secure user authentication and registration system using Firebase Auth with email/password and social login options.',
      status: 'completed', // ✅ COMPLETATO
      techStack: ['Firebase Auth', 'React Context', 'TypeScript', 'Protected Routes'],
      features: [
        '✅ Email/password registration',
        '✅ Social login (Google, GitHub)',
        '✅ Password reset functionality',
        '✅ User profile management',
        '✅ Session management',
        '✅ Protected route system'
      ],
      estimatedDays: 5,
      actualDays: 1, // Completato in 1 giorno
      icon: '🔐'
    },
    {
      id: 3,
      title: 'Firestore Chat History',
      description: 'Persist chat conversations and user data using Firestore database with real-time synchronization across devices.',
      status: 'completed', // ✅ COMPLETATO
      techStack: ['Firestore', 'Firebase SDK', 'Real-time listeners', 'Data modeling'],
      features: [
        '✅ Chat session persistence',
        '✅ Cross-device synchronization',
        '✅ Real-time data updates',
        '✅ Auto-save functionality',
        '✅ Session management',
        '✅ Optimistic UI updates'
      ],
      estimatedDays: 6,
      actualDays: 1, // Completato in 1 giorno
      icon: '💾'
    },
    {
      id: 4,
      title: 'UI/UX Optimization & Polish',
      description: 'Perfect the user interface with DeepSeek-inspired design, responsive layouts, and smooth interactions for optimal user experience.',
      status: 'in-progress', // 🔄 IN CORSO
      techStack: ['Tailwind CSS', 'Responsive Design', 'UI Components', 'Animations'],
      features: [
        '✅ DeepSeek-inspired layout',
        '✅ Welcome state interface',
        '✅ Message bubble styling',
        '✅ Input positioning optimization',
        '🔄 Mobile responsiveness',
        '🔄 Dark mode support',
        '🔄 Accessibility improvements'
      ],
      estimatedDays: 3,
      icon: '🎨'
    },
    {
      id: 5,
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
      id: 6,
      title: 'Advanced Features & API Enhancement',
      description: 'Implement DeepThink (R1) functionality, search capabilities, and enhanced AI interactions with better context management.',
      status: 'planned',
      techStack: ['Advanced AI APIs', 'Search Integration', 'Context Management', 'Performance'],
      features: [
        'DeepThink (R1) implementation',
        'Global search functionality',
        'Enhanced context handling',
        'Message search within chats',
        'Performance optimizations',
        'Error handling improvements'
      ],
      estimatedDays: 5,
      icon: '🧠'
    },
    {
      id: 7,
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
    const inProgressPhases = phases.filter(p => p.status === 'in-progress').length
    const currentPhaseIndex = phases.findIndex(p => p.status === 'in-progress')
    
    // Calculate actual progress including partial progress for in-progress phases
    const progressPercentage = ((completedPhases + (inProgressPhases * 0.5)) / phases.length) * 100
    
    return {
      totalPhases: phases.length,
      completedPhases,
      currentPhase: currentPhaseIndex >= 0 ? currentPhaseIndex + 1 : completedPhases + 1,
      progressPercentage: Math.round(progressPercentage)
    }
  }, [phases])

  return { phases, stats }
}
