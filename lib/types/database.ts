export type ProjectStatus = "todo" | "in-progress" | "done" | "canceled" | "backlog";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export interface DBProject {
  id: string;
  project_code: string;
  name: string;
  description: string | null;
  intent: "Delivery" | "Experiment" | "Internal" | null;
  structure_type: "Linear" | "Milestone" | null;
  target_produksi: string | null;
  target_revenue: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  pic_name: string | null;
  client: string | null;
  tags: string[] | null;
  start_date: string | null;
  end_date: string | null;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface DBTask {
  id: string;
  project_id: string;
  name: string;
  phase: string;
  assignee_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "todo" | "in-progress" | "done";
  priority: ProjectPriority;
  created_at: string;
}

export interface DBNote {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  note_type: "general" | "meeting" | "audio";
  status: "completed" | "processing";
  added_by: {
    id: string;
    name: string;
  } | null;
  created_at: string;
}

export interface DBFile {
  id: string;
  project_id: string;
  name: string;
  type: string;
  size_mb: number;
  url: string;
  description: string | null;
  added_by: {
    id: string;
    name: string;
  } | null;
  created_at: string;
}

export interface DBScope {
  id: string;
  project_id: string;
  in_scope: string[];
  out_of_scope: string[];
}
