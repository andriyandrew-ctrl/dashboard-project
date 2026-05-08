"use client"

import { useEffect, useMemo, useState } from "react"
import { DotsSixVertical, Plus, ListChecks, CheckCircle, PlayCircle, CircleDashed, Clock, X, Spinner, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr"
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import type { ProjectDetails, ProjectTask, User } from "@/lib/data/project-details"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// IMPORT PIPA DATABASE KITA
import { createTaskInDB, updateTaskStatusInDB, deleteTaskInDB, updateTaskInDB } from "@/lib/data/project-actions"
import { Trash } from "@phosphor-icons/react/dist/ssr"
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal"

type ProjectTasksTabProps = {
  project: any // Diubah menjadi any untuk mempermudah mapping custom dbId
}



export function ProjectTasksTab({ project }: ProjectTasksTabProps) {
  // Mapping ulang tasks dari array workstreams agar rata
  const getTasks = () => {
    const ws = project.workstreams || [];
    return ws.flatMap((w: any) => w.tasks.map((t: any) => ({ ...t, workstreamName: w.name })));
  };

  const [tasks, setTasks] = useState<any[]>(getTasks())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskPhase, setNewTaskPhase] = useState("Planning & Coordination")
  const [newTaskPIC, setNewTaskPIC] = useState("")
  const [newTaskStartDate, setNewTaskStartDate] = useState(new Date().toISOString().split('T')[0])
  const [newTaskEndDate, setNewTaskEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    setTasks(getTasks())
  }, [project])

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    
    // Update Lokal (Optimistic)
    setTasks((prev) => prev.map((task) => task.id === taskId ? { ...task, status: newStatus } : task))
    
    try {
      await updateTaskStatusInDB(taskId, newStatus as any, project.dbId);
      toast.success("Status pekerjaan diperbarui.");
      router.refresh();
    } catch (error) {
      toast.error("Gagal sinkronisasi status ke database.");
      // Rollback jika gagal
      setTasks((prev) => prev.map((task) => task.id === taskId ? { ...task, status: currentStatus } : task))
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    // Optimistic Delete
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter(t => t.id !== taskToDelete));
    setIsDeleteModalOpen(false);

    try {
      await deleteTaskInDB(taskToDelete, project.dbId);
      toast.success("Pekerjaan berhasil dihapus.");
      setTaskToDelete(null);
      router.refresh();
    } catch (error) {
      toast.error("Gagal menghapus pekerjaan.");
      setTasks(originalTasks); // Rollback
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id)
    setNewTaskName(task.name)
    setNewTaskPhase(task.phase || task.workstreamName || "Planning & Coordination")
    setNewTaskPIC(task.assignee?.name || task.assignee_id || "")
    setNewTaskStartDate(task.start_date || task.startDate || new Date().toISOString().split('T')[0])
    setNewTaskEndDate(task.end_date || task.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    setIsModalOpen(true)
  }

  // FUNGSI UTAMA: MENGIRIM DATA TASK KE SUPABASE
  const handleSubmitNewTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim() || !newTaskPhase) {
        toast.error("Nama pekerjaan dan Fase harus diisi!")
        return
    }

    const formatPICName = (name: string) => {
      return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    const finalPIC = newTaskPIC.trim() ? formatPICName(newTaskPIC.trim()) : "Unassigned";

    setIsSubmitting(true);

    if (editingTaskId) {
      const updatedTask = {
        ...tasks.find(t => t.id === editingTaskId),
        name: newTaskName,
        phase: newTaskPhase,
        assignee_id: finalPIC,
        start_date: newTaskStartDate,
        end_date: newTaskEndDate,
        workstreamName: newTaskPhase,
        assignee: { name: finalPIC, avatarUrl: "" }
      };

      setTasks((prev) => prev.map((t) => t.id === editingTaskId ? updatedTask : t));
      setIsModalOpen(false);
      setEditingTaskId(null);
      setNewTaskName("");

      try {
        await updateTaskInDB(editingTaskId, {
          name: newTaskName,
          phase: newTaskPhase,
          assignee_id: finalPIC,
          start_date: newTaskStartDate,
          end_date: newTaskEndDate,
        });
        toast.success("Pekerjaan berhasil diperbarui!");
        router.refresh();
      } catch (error: any) {
        toast.error(`Gagal memperbarui: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 1. Optimistic Update (Tambah ke UI dulu)
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      name: newTaskName,
      phase: newTaskPhase,
      status: "todo",
      assignee_id: finalPIC,
      start_date: newTaskStartDate,
      end_date: newTaskEndDate,
      project_id: project.dbId,
      workstreamName: newTaskPhase
    };

    setTasks((prev) => [...prev, optimisticTask]);
    setIsModalOpen(false);
    setNewTaskName("");

    try {
      const savedTask = await createTaskInDB({
        project_id: project.dbId, 
        name: newTaskName,
        phase: newTaskPhase,
        assignee_id: finalPIC,
        start_date: newTaskStartDate,
        end_date: newTaskEndDate,
      });

      // Update ID asli dari DB
      setTasks((prev) => prev.map(t => t.id === tempId ? { ...t, id: savedTask.id } : t));
      toast.success("Pekerjaan baru berhasil ditambahkan!");
      router.refresh();

    } catch (error: any) {
      toast.error(`Gagal menyimpan: ${error.message}`);
      // Rollback jika gagal
      setTasks((prev) => prev.filter(t => t.id !== tempId));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-5 shadow-sm space-y-4 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <ListChecks className="h-6 w-6" weight="fill" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Master Task List</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-8 rounded-lg border-border/60 bg-background px-3 text-xs font-medium shadow-sm hover:bg-muted">View</Button>
          <Button size="sm" className="h-8 rounded-lg px-3 text-xs font-medium shadow-sm" onClick={() => { setEditingTaskId(null); setNewTaskName(""); setNewTaskPhase("Planning & Coordination"); setNewTaskPIC(""); setIsModalOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" weight="bold" /> New Task
          </Button>
        </div>
      </header>

      {tasks.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-12 text-center">
            <div className="flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <ListChecks className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">TIDAK ADA TUGAS</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">Belum ada daftar pekerjaan yang dibuat untuk proyek ini.</p>
            </div>
        </section>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex flex-col">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                {tasks.map((task, index) => (
                    <div key={task.id} className={cn("border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30", index % 2 === 0 ? "bg-background" : "bg-muted/5")}>
                    <TaskRowDnD task={task as any} onToggle={() => toggleTask(task.id, task.status)} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id)} />
                    </div>
                ))}
                </SortableContext>
            </DndContext>
            </div>
        </div>
      )}

      {/* PERBAIKAN: z-index diturunkan ke z-50 agar SelectContent (Dropdown) bisa muncul di atasnya */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card rounded-xl shadow-xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
                    <h3 className="text-base font-bold text-foreground">{editingTaskId ? "Edit Pekerjaan" : "Tambah Pekerjaan Baru"}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="text-muted-foreground hover:text-foreground disabled:opacity-50">
                        <X className="h-5 w-5" weight="bold" />
                    </button>
                </div>
                <form onSubmit={handleSubmitNewTask} className="p-5 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Pekerjaan</label>
                        <Input placeholder="Contoh: Desain Plat Baja 4mm" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} disabled={isSubmitting} className="bg-background" autoFocus />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Kategori Pekerjaan</label>
                        <Select value={newTaskPhase} onValueChange={setNewTaskPhase} disabled={isSubmitting}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectItem value="Planning & Coordination">Planning & Coordination</SelectItem>
                                <SelectItem value="Research & Data Collection">Research & Data Collection</SelectItem>
                                <SelectItem value="Business Development">Business Development</SelectItem>
                                <SelectItem value="Documentation & Administration">Documentation & Administration</SelectItem>
                                <SelectItem value="Execution / Implementation">Execution / Implementation</SelectItem>
                                <SelectItem value="Review & Reporting">Review & Reporting</SelectItem>
                                <SelectItem value="Support Task">Support Task</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Tugaskan Ke (PIC)</label>
                        <Input placeholder="Contoh: Ivan Engineer" value={newTaskPIC} onChange={(e) => setNewTaskPIC(e.target.value)} disabled={isSubmitting} className="bg-background" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Tgl Mulai</label>
                            <Input type="date" value={newTaskStartDate} onChange={(e) => setNewTaskStartDate(e.target.value)} disabled={isSubmitting} className="bg-background" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Tgl Selesai</label>
                            <Input type="date" value={newTaskEndDate} onChange={(e) => setNewTaskEndDate(e.target.value)} disabled={isSubmitting} className="bg-background" />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Spinner className="h-4 w-4 animate-spin mr-2" /> : null}
                          Simpan Task
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <DeleteConfirmModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteTask}
        title="Hapus Pekerjaan?"
        description="Apakah Bapak yakin ingin menghapus pekerjaan ini? Data yang sudah dihapus tidak bisa dikembalikan."
        isLoading={isSubmitting}
      />
    </section>
  )
}

function TaskBadges({ workstreamName }: { workstreamName?: string }) {
  if (!workstreamName) return null
  let shortName = workstreamName.includes("Engineering") ? "Eng." : workstreamName.includes("Procurement") ? "Proc." : workstreamName.includes("Constr") ? "Constr." : workstreamName.substring(0, 8);
  return <Badge variant="secondary" className="whitespace-nowrap text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 border border-blue-200">{shortName}</Badge>
}

function TaskStatus({ status }: { status: string }) {
  switch (status) {
    case "done": return <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" weight="fill" /><span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Done</span></div>
    case "in-progress": return <div className="flex items-center gap-1.5"><PlayCircle className="h-4 w-4 text-amber-500" weight="fill" /><span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Active</span></div>
    default: return <div className="flex items-center gap-1.5"><CircleDashed className="h-4 w-4 text-muted-foreground" weight="bold" /><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">To Do</span></div>
  }
}

function TaskRowDnD({ task, onToggle, onEdit, onDelete }: { task: ProjectTask | any, onToggle: () => void, onEdit: () => void, onDelete: () => void }) {
  const isDone = task.status === "done"
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4 group", isDragging && "relative z-50 bg-background shadow-lg rounded-lg opacity-80")}>
      <div className="flex items-center gap-3 flex-1 min-w-[120px]">
        <button type="button" onClick={onToggle} className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors cursor-pointer", isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/40 hover:border-primary")}>
          {isDone && <CheckCircle weight="bold" className="h-3 w-3" />}
        </button>
        <span className={cn("text-[13px] font-medium truncate", isDone ? "text-muted-foreground line-through" : "text-foreground")}>{task.name}</span>
      </div>

      <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
        <div className="hidden sm:flex items-center justify-end w-[45px] md:w-[50px]">
          <TaskBadges workstreamName={task.workstreamName} />
        </div>
        <div className="hidden sm:flex items-center w-[65px]">
          <TaskStatus status={task.status} />
        </div>
        <div className="hidden md:flex items-center w-[55px]">
          {task.dueLabel && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-[10px] font-bold tracking-tight truncate text-muted-foreground">{task.dueLabel}</span>
            </div>
          )}
        </div>
        <div className="w-[24px] flex justify-end">
          {task.assignee ? (
            <Avatar className="size-6 border border-background shadow-sm" title={task.assignee.name}>
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                {task.assignee.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="size-6 rounded-full border border-dashed border-border/70 flex items-center justify-center bg-muted/30" title="Unassigned">
              <span className="text-[9px] text-muted-foreground">?</span>
            </div>
          )}
        </div>
        <Button type="button" size="icon-sm" variant="ghost" className="h-6 w-6 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted" onClick={onEdit}>
          <PencilSimpleLine className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" className="h-6 w-6 rounded-md text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" onClick={onDelete}>
          <Trash className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" className="h-6 w-6 rounded-md text-muted-foreground cursor-grab active:cursor-grabbing hover:bg-muted" {...attributes} {...listeners}>
          <DotsSixVertical className="h-4 w-4" weight="bold" />
        </Button>
      </div>
    </div>
  )
}