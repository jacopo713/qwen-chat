export interface RoadmapPhase {
  id: number
  title: string
  description: string
  status: 'planned' | 'in-progress' | 'completed'
  techStack: string[]
  features: string[]
  estimatedDays: number
  icon: string
}

export interface ProjectStats {
  totalPhases: number
  completedPhases: number
  currentPhase: number
  progressPercentage: number
}
