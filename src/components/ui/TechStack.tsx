import React from 'react'

interface TechStackProps {
  technologies: string[]
  title?: string
}

export default function TechStack({ technologies, title = 'Tech Stack' }: TechStackProps) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md border border-blue-200 dark:border-blue-700"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
