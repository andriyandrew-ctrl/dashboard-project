"use server"

import { createClient } from '@/lib/supabase/server'
import { DBProject, DBTask, DBNote, DBFile, DBScope } from '@/lib/types/database'

// Definisi Interface untuk Proyek Baru
export interface NewProjectData {
  name: string;
  description?: string;
  intent?: 'Delivery' | 'Experiment' | 'Internal';
  structure_type?: 'Linear' | 'Milestone';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  target_produksi?: string;
  target_revenue?: string;
  pic_name?: string;
  client?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  location?: string;
}

/**
 * Mebuat Proyek Baru di Supabase
 */
export async function createProjectInDB(projectData: NewProjectData) {
  const randomCode = `PRJ-${Math.floor(10000 + Math.random() * 90000)}`

  const payload = {
    project_code: randomCode,
    name: projectData.name,
    description: projectData.description || '',
    intent: projectData.intent || 'Internal',
    structure_type: projectData.structure_type || 'Linear',
    target_produksi: projectData.target_produksi || '',
    target_revenue: projectData.target_revenue || '',
    status: 'todo',
    priority: projectData.priority || 'medium',
    pic_name: projectData.pic_name || 'Andri Setyawan',
    client: projectData.client || '',
    tags: projectData.tags || [],
    location: projectData.location || '',
    start_date: projectData.startDate,
    end_date: projectData.endDate,
    progress_percent: 0
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert([payload])
    .select()

  if (error) {
    console.error("Gagal menyimpan proyek ke Supabase:", error.message)
    throw new Error(`Database Error: ${error.message}`)
  }

  return data[0]
}

/**
 * Mengambil semua proyek (untuk Dashboard)
 */
export async function getAllProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, tasks (*), project_notes (*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Gagal mengambil data proyek:", error.message)
    return []
  }

  return data
}

/**
 * Mengambil detail 1 proyek beserta Tasks dan Scopes-nya
 */
export async function getProjectById(id: string) {
  const supabase = await createClient()
  
  // 1. Cek apakah ID adalah UUID atau Project Code
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  let query = supabase.from('projects').select('*')
  
  if (isUUID) {
    query = query.eq('id', id)
  } else {
    query = query.eq('project_code', id)
  }

  const { data: project, error: projectError } = await query.single()

  if (projectError || !project) {
    console.error("Gagal mengambil detail proyek:", projectError?.message)
    return null
  }

  const projectId = project.id

  // 2. Fetch related data separately to avoid complex join errors (like 406)
  const [scopesRes, tasksRes, notesRes, filesRes] = await Promise.all([
    supabase.from('project_scopes').select('*').eq('project_id', projectId),
    supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at'),
    supabase.from('project_notes').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  ])

  // Combine data
  return {
    ...project,
    project_scopes: scopesRes.data || [],
    tasks: tasksRes.data || [],
    project_notes: notesRes.data || [],
    project_files: filesRes.data || []
  }
}

/**
 * FUNGSI BARU: Menyimpan Task / Pekerjaan ke Database
 */
export async function createTaskInDB(taskData: {
  project_id: string;
  name: string;
  phase: string;
  assignee_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      project_id: taskData.project_id,
      name: taskData.name,
      phase: taskData.phase,
      assignee_id: taskData.assignee_id !== 'unassigned' ? taskData.assignee_id : null,
      start_date: taskData.start_date || new Date().toISOString(),
      end_date: taskData.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default +7 Hari
      status: 'todo',
      priority: 'medium'
    }])
    .select()

  if (error) {
    console.error("Gagal menyimpan task:", error.message)
    throw new Error(`Database Error: ${error.message}`)
  }

  return data[0]
}

/**
 * Menyimpan Catatan Baru ke Database
 */
export async function createNoteInDB(noteData: {
  project_id: string;
  title: string;
  content: string;
  note_type: string;
  added_by: { id: string; name: string };
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_notes')
    .insert([{
      project_id: noteData.project_id,
      title: noteData.title,
      content: noteData.content,
      note_type: noteData.note_type,
      status: 'processing',
      added_by: noteData.added_by
    }])
    .select()

  if (error) {
    console.error("Gagal menyimpan note:", error.message)
    throw new Error(`Database Error: ${error.message}`)
  }
  return data[0]
}

/**
 * Mengupload file fisik ke Supabase Storage dan mengembalikan URL publiknya
 */
export async function uploadFileToStorage(formData: FormData, project_id: string) {
  const file = formData.get('file') as File
  if (!file) throw new Error("No file provided")

  const fileExt = file.name.split('.').pop()
  const fileName = `${project_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('project-assets')
    .upload(filePath, file)

  if (error) {
    console.error("Gagal upload ke Storage:", error.message)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('project-assets')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Menyimpan Metadata File Baru ke Database
 */
export async function addFileToDB(fileData: {
  project_id: string;
  name: string;
  type: string;
  size_mb: number;
  url: string;
  added_by: { id: string; name: string };
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_files')
    .insert([{
      project_id: fileData.project_id,
      name: fileData.name,
      type: fileData.type,
      size_mb: fileData.size_mb,
      url: fileData.url,
      description: 'Baru diunggah',
      added_by: fileData.added_by
    }])
    .select()

  if (error) {
    console.error("Gagal menyimpan file metadata:", error.message)
    throw new Error(`Database Error: ${error.message}`)
  }
  return data[0]
}

/**
 * Menghapus File dari Database dan Storage
 */
export async function deleteFileAction(fileId: string, url: string) {
  const supabase = await createClient()
  // 1. Ambil path storage dari URL
  // Contoh: .../project-assets/ID-PROYEK/NAMA-FILE.pdf
  const pathParts = url.split('project-assets/');
  const storagePath = pathParts.length > 1 ? pathParts[1] : null;

  // 2. Hapus Metadata di Database
  const { error: dbError } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    console.error("Gagal hapus metadata:", dbError.message);
    throw dbError;
  }

  // 3. Hapus File Fisik di Storage
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from('project-assets')
      .remove([storagePath]);

    if (storageError) {
      console.warn("Gagal hapus fisik di storage (mungkin sudah hilang):", storageError.message);
    }
  }

  return true;
}

/**
 * Memperbarui Data Proyek yang sudah ada
 */
export async function updateProjectInDB(projectId: string, projectData: Partial<NewProjectData>) {
  const payload: Partial<DBProject> = {
    name: projectData.name,
    description: projectData.description,
    intent: projectData.intent,
    structure_type: projectData.structure_type,
    target_produksi: projectData.target_produksi,
    target_revenue: projectData.target_revenue,
    pic_name: projectData.pic_name,
    client: projectData.client,
    tags: projectData.tags,
    location: projectData.location,
    start_date: projectData.startDate,
    end_date: projectData.endDate,
    updated_at: new Date().toISOString()
  }

  // Remove undefined keys
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  )

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .update(cleanPayload)
    .eq('id', projectId)
    .select()

  if (error) {
    console.error("Gagal update proyek:", error.message)
    throw error
  }
  return data[0]
}

/**
 * Menghapus Proyek Beserta Seluruh Datanya (Cascade)
 */
export async function deleteProjectInDB(projectId: string) {
  const supabase = await createClient()
  // 1. Hapus Relasi Manual (Safety Cascade)
  await supabase.from('project_scopes').delete().eq('project_id', projectId)
  await supabase.from('tasks').delete().eq('project_id', projectId)
  await supabase.from('project_notes').delete().eq('project_id', projectId)
  await supabase.from('project_files').delete().eq('project_id', projectId)

  // 2. Hapus Proyek Utama
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error("Gagal hapus proyek:", error.message)
    throw error
  }
  return true
}

/**
 * Memperbarui Status Task & Menghitung Ulang Progres Proyek
 */
export async function updateTaskStatusInDB(taskId: string, status: 'todo' | 'in-progress' | 'done', projectId: string) {
  const supabase = await createClient()
  // 1. Update Status Task
  const { error: taskError } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)

  if (taskError) throw taskError

  // 2. Ambil Semua Task Proyek Ini untuk Hitung Progres
  const { data: tasks, error: fetchError } = await supabase
    .from('tasks')
    .select('status')
    .eq('project_id', projectId)

  if (fetchError) {
    console.error("Gagal mengambil daftar task untuk hitung progres:", fetchError.message)
    return true // Tetap return true karena status task sudah terupdate
  }

  if (tasks) {
    const totalTasks = tasks.length
    const doneTasks = tasks.filter(t => t.status === 'done').length
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    console.log(`Menghitung progres proyek ${projectId}: ${doneTasks}/${totalTasks} selesai. Hasil: ${progress}%`)

    // 3. Update Progres di Tabel Projects
    const { error: projectError } = await supabase
      .from('projects')
      .update({ 
        progress_percent: progress, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', projectId)

    if (projectError) {
      console.error("Gagal update progres proyek:", projectError.message)
    }
  }

  return true
}

/**
 * Menghapus Task
 */
export async function deleteTaskInDB(taskId: string, projectId?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) throw error

  if (projectId) {
    await recalculateProjectProgress(projectId)
  }

  return true
}

export async function recalculateProjectProgress(projectId: string) {
  const supabase = await createClient()
  const { data: tasks, error: fetchError } = await supabase
    .from('tasks')
    .select('status')
    .eq('project_id', projectId)

  if (fetchError) {
    console.error("Gagal ambil task untuk progres:", fetchError.message)
    return
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  await supabase
    .from('projects')
    .update({ progress_percent: progress, updated_at: new Date().toISOString() })
    .eq('id', projectId)
}

/**
 * Menghapus Note
 */
export async function deleteNoteInDB(noteId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('project_notes')
    .delete()
    .eq('id', noteId)

  if (error) throw error
  return true
}

/**
 * Memperbarui Catatan yang sudah ada
 */
export async function updateNoteInDB(noteId: string, updates: { title?: string; content?: string; note_type?: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_notes')
    .update(updates)
    .eq('id', noteId)
    .select()

  if (error) {
    console.error("Gagal update note:", error.message)
    throw error
  }
  return data[0]
}

/**
 * Memperbarui Scope of Work (In Scope & Out of Scope)
 */
export async function updateProjectScope(projectId: string, inScope: string[], outOfScope: string[]) {
  const supabase = await createClient()
  // ... (Existing code kept as is) ...
  const { data: existingScope } = await supabase
    .from('project_scopes')
    .select('id')
    .eq('project_id', projectId)
    .single()

  let result, error;
  
  if (existingScope) {
    const response = await supabase
      .from('project_scopes')
      .update({ in_scope: inScope, out_of_scope: outOfScope })
      .eq('project_id', projectId)
      .select();
    result = response.data;
    error = response.error;
  } else {
    const response = await supabase
      .from('project_scopes')
      .insert([{ project_id: projectId, in_scope: inScope, out_of_scope: outOfScope }])
      .select();
    result = response.data;
    error = response.error;
  }

  if (error) {
    console.error("Gagal update scope:", error.message);
    throw new Error(`Database Error: ${error.message}`);
  }

  return result;
}