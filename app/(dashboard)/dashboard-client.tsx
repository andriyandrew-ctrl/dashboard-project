"use client"

import { useState } from "react"
import { ProjectCardsView } from "@/components/project-cards-view"
import { ProjectWizard } from "@/components/project-wizard/ProjectWizard"
import { useRouter } from "next/navigation"

type DashboardClientProps = {
  projectsData: any[]
}

export function DashboardClient({ projectsData }: DashboardClientProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <div className="flex flex-1 flex-col bg-background mx-3 my-3 border border-border/60 rounded-2xl min-w-0 shadow-sm overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-card sticky top-0 z-10">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-foreground">Project Portfolio Dashboard</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Centralized monitoring of all active projects</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <ProjectCardsView 
            projects={projectsData} 
            loading={false}
            onCreateProject={() => setIsWizardOpen(true)}
          />
        </main>
      </div>

      {isWizardOpen && (
        <ProjectWizard 
          onClose={() => setIsWizardOpen(false)} 
          onCreate={() => {
            setIsWizardOpen(false)
            router.refresh()
          }} 
        />
      )}
    </>
  )
}
