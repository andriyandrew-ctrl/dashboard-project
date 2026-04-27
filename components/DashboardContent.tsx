"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectCardsView } from "@/components/project-cards-view"
import { ProjectWizard } from "@/components/project-wizard/ProjectWizard"
import { useRouter } from "next/navigation"

interface DashboardContentProps {
  initialProjects: any[]
  user?: { name?: string | null, email?: string | null, image?: string | null }
}

export function DashboardContent({ initialProjects, user }: DashboardContentProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const router = useRouter()

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar user={user} />
        
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-muted/20">
          {/* KOTAK UTAMA PREMIUM SEPERTI HALAMAN PERFORMANCE */}
          <div className="flex flex-1 flex-col bg-background mx-3 my-3 border border-border/60 rounded-2xl min-w-0 shadow-sm overflow-hidden">
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-card sticky top-0 z-10">
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight text-foreground">Project Portfolio Dashboard</h1>
                <p className="text-[11px] text-muted-foreground font-medium">Centralized monitoring of all active projects</p>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
              <ProjectCardsView 
                projects={initialProjects} 
                loading={false}
                onCreateProject={() => setIsWizardOpen(true)}
              />
            </main>
          </div>
        </SidebarInset>
      </div>

      {isWizardOpen && (
        <ProjectWizard 
          onClose={() => setIsWizardOpen(false)} 
          onCreate={() => {
            setIsWizardOpen(false)
            router.refresh() // MENGGANTIKAN window.location.reload()
          }} 
        />
      )}
    </SidebarProvider>
  )
}
