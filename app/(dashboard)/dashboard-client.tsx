"use client"

import { useState } from "react"
import { ProjectCardsView } from "@/components/project-cards-view"
import { ProjectWizard } from "@/components/project-wizard/ProjectWizard"

type DashboardClientProps = {
  projectsData: any[]
}

export function DashboardClient({ projectsData }: DashboardClientProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight">General Project Dashboard</h1>
        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
          Manager R&D
        </span>
      </header>

      <main className="flex-1 overflow-y-auto bg-muted/10 p-4">
        <ProjectCardsView 
          projects={projectsData} 
          loading={false}
          onCreateProject={() => setIsWizardOpen(true)}
        />
      </main>

      {isWizardOpen && (
        <ProjectWizard 
          onClose={() => setIsWizardOpen(false)} 
          onCreate={() => {
            setIsWizardOpen(false)
            window.location.reload() 
          }} 
        />
      )}
    </>
  )
}
