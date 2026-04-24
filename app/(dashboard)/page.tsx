import { getAllProjects } from "@/lib/data/project-actions"
import { DashboardClient } from "./dashboard-client"

interface DBProject {
  id: string;
  project_code: string;
  name: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  progress_percent: number;
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const dataFromDB = await getAllProjects()
  
  const formattedProjects = dataFromDB.map((dbProj: any) => ({
    ...dbProj,
    id: dbProj.id,
    name: dbProj.name,
    title: dbProj.name,
    project_code: dbProj.project_code,
    status: dbProj.status,
    priority: dbProj.priority,
    progress: dbProj.progress_percent || 0,
    targetDate: dbProj.end_date,
    assignees: [ { avatar: "", name: dbProj.pic_name || "Unassigned" } ],
    tags: dbProj.tags || []
  }))

  return <DashboardClient projectsData={formattedProjects} />
}
