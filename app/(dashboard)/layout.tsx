import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  // Mapping data user dari Supabase agar sesuai dengan prop AppSidebar
  const mappedUser = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0],
    email: user.email,
    image: null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar user={mappedUser} />
        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
