import { getAllProjects } from "@/lib/data/project-actions"
import { DashboardContent } from "@/components/DashboardContent"
import { DBProject } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const mappedUser = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0],
    email: user.email,
    image: null
  }

  const dataFromDB = await getAllProjects()
  
  // Kita sesuaikan format datanya di server agar Client Component tinggal pakai
  const formattedProjects = (dataFromDB || []).map((dbProj: any) => {
    const tasks = dbProj.tasks || [];
    const hasTasks = tasks.length > 0;
    const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
    const progress = hasTasks ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    // Derived Status
    let derivedStatus = 'todo'; // Akan diterjemahkan jadi 'Planned' di card
    const endDateStr = dbProj.end_date;
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    // Gunakan setHours untuk perbandingan tanggal wajar
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const isPastDue = today > end;
    
    if (!hasTasks) {
      derivedStatus = 'todo'; 
    } else if (completedTasks === tasks.length) {
      derivedStatus = 'done'; 
    } else if (isPastDue) {
      derivedStatus = 'backlog'; 
    } else {
      derivedStatus = 'in-progress'; 
    }

    return {
      id: dbProj.id,
      name: dbProj.name,
      title: dbProj.name,
      project_code: dbProj.project_code,
      status: derivedStatus,
      priority: dbProj.priority,
      progress: progress,
      targetDate: endDateStr ? new Date(endDateStr).toISOString() : undefined,
      assignees: [ { avatar: "", name: dbProj.pic_name || "Unassigned" } ],
      tags: dbProj.tags || [],
      client: dbProj.client, // Untuk ditampilkan sebagai Partner
    };
  })

  return <DashboardContent initialProjects={formattedProjects} user={mappedUser} />
}