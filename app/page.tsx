import { getAllProjects } from "@/lib/data/project-actions"
import { DashboardContent } from "@/components/DashboardContent"
import { DBProject } from "@/lib/types/database"

export default async function DashboardPage() {
  const dataFromDB = await getAllProjects()
  
  // Kita sesuaikan format datanya di server agar Client Component tinggal pakai
  const formattedProjects = (dataFromDB || []).map((dbProj: DBProject) => ({
    id: dbProj.id,
    name: dbProj.name,
    title: dbProj.name,
    project_code: dbProj.project_code,
    status: dbProj.status,
    priority: dbProj.priority,
    progress: dbProj.progress_percent || 0,
    dueDate: dbProj.end_date 
      ? new Date(dbProj.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : '-',
    assignees: [ { avatar: "", name: dbProj.pic_name || "Unassigned" } ],
    tags: dbProj.tags || ["R&D"]
  }))

  return <DashboardContent initialProjects={formattedProjects} />
}