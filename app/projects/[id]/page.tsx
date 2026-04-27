import { AppSidebar } from "@/components/app-sidebar"
import { ProjectDetailsPage } from "@/components/projects/ProjectDetailsPage"
import { createClient } from "@/lib/supabase/server"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { notFound } from "next/navigation"

// IMPORT FUNGSI PENYEDOT DATA DARI DATABASE
import { getProjectById } from "@/lib/data/project-actions"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const mappedUser = session?.user ? {
    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User",
    email: session.user.email || "No email",
    avatar: "",
  } : {
    name: "User",
    email: "No email",
    avatar: "",
  }

  // 1. TARIK DATA ASLI DARI SUPABASE BERDASARKAN ID
  const projectData = await getProjectById(id)

  // Jika data tidak ditemukan di database, tampilkan halaman 404
  if (!projectData) {
    notFound()
  }

  return (
    <SidebarProvider>
      <AppSidebar user={mappedUser} />
      <SidebarInset>
        {/* 2. LEMPAR DATA ASLI (projectData) KE KOMPONEN UI BAPAK */}
        <ProjectDetailsPage projectId={id} dbData={projectData} />
      </SidebarInset>
    </SidebarProvider>
  )
}