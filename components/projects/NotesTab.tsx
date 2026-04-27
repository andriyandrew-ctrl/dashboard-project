"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Books, Article, Spinner } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

import type { ProjectNote, User } from "@/lib/data/project-details"
import { Button } from "@/components/ui/button"
import { NoteCard } from "@/components/projects/NoteCard"
import { NotesTable } from "@/components/projects/NotesTable"
import { CreateNoteModal } from "@/components/projects/CreateNoteModal"
import { UploadAudioModal } from "@/components/projects/UploadAudioModal"
import { NotePreviewModal } from "@/components/projects/NotePreviewModal"
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal"

type NotesTabProps = {
    notes: ProjectNote[]
    currentUser?: User
}

const defaultUser: User = {
    id: "andri-s",
    name: "Andri Setyawan",
    avatarUrl: undefined,
}

export function NotesTab({ notes, currentUser = defaultUser }: NotesTabProps) {
    const params = useParams()
    const urlId = params?.id as string

    // STATE MANAGEMENT DB
    const [localNotes, setLocalNotes] = useState<ProjectNote[]>([])
    const [projectDbId, setProjectDbId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null)
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // 1. SYNC PROPS KE LOCAL STATE
    useEffect(() => {
        if (notes && notes.length > 0) {
            const mapped = notes.map((n: any) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                noteType: n.note_type || n.noteType,
                status: n.status,
                addedDate: n.created_at ? new Date(n.created_at) : (n.addedDate ? new Date(n.addedDate) : new Date()),
                addedBy: n.added_by || n.addedBy || { id: 'unknown', name: 'Unknown' }
            }));
            setLocalNotes(mapped);
        } else {
            setLocalNotes([]);
        }
    }, [notes]);

    useEffect(() => {
        if (urlId) {
            setProjectDbId(urlId); // Default to urlId, will be updated if it's a code
            if (urlId.startsWith('PRJ-')) {
                supabase.from('projects').select('id').eq('project_code', urlId).single().then(({ data }) => {
                    if (data) setProjectDbId(data.id);
                });
            }
        }
    }, [urlId]);

    const recentNotes = localNotes.slice(0, 8)

    const handleAddNote = () => setIsCreateModalOpen(true)

    // 2. CREATE NOTE KE SUPABASE (Optimistic)
    const handleCreateNote = async (title: string, content: string, noteType: string) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticNote: ProjectNote = {
            id: tempId,
            title,
            content,
            noteType: noteType as any,
            status: 'open',
            addedDate: new Date(),
            addedBy: { id: currentUser.id, name: currentUser.name }
        };

        setLocalNotes((prev) => [optimisticNote, ...prev]);
        setIsCreateModalOpen(false);

        try {
            const newNotePayload = {
                project_id: projectDbId,
                title,
                content,
                note_type: noteType,
                status: 'open',
                added_by: currentUser.name
            };

            const { data, error } = await supabase.from('project_notes').insert([newNotePayload]).select().single();
            if (error) throw error;

            // Update with real ID
            setLocalNotes((prev) => prev.map(n => n.id === tempId ? { ...n, id: data.id } : n));
            toast.success("Catatan berhasil ditambahkan!");
            router.refresh();
        } catch (error: any) {
            toast.error(`Gagal menyimpan: ${error.message}`);
            setLocalNotes((prev) => prev.filter(n => n.id !== tempId)); // Rollback
        }
    }

    const handleUploadAudio = () => setIsUploadModalOpen(true)

    const handleFileSelect = (fileName: string) => {
        setIsUploadModalOpen(false)
        setIsCreateModalOpen(false)
        toast(`Memproses file "${fileName}"...`)
        setTimeout(() => toast.success(`File "${fileName}" berhasil dilampirkan.`), 2000)
    }

    const handleNoteClick = (note: ProjectNote) => {
        setSelectedNote(note)
        setIsPreviewModalOpen(true)
    }

    const handleEditNote = (noteId: string) => {
        const note = localNotes.find(n => n.id === noteId);
        if (note) {
            setSelectedNote(note);
            setIsPreviewModalOpen(true);
            toast.info("Anda dapat mengedit dokumen ini di jendela preview.");
        }
    }

    // 3. DELETE NOTE DARI SUPABASE
    const handleDeleteNote = (noteId: string) => {
        setNoteToDelete(noteId);
        setIsDeleteModalOpen(true);
    }

    const confirmDeleteNote = async () => {
        if (!noteToDelete) return;
        
        // Optimistic Delete
        const originalNotes = [...localNotes];
        setLocalNotes((prev) => prev.filter(n => n.id !== noteToDelete));
        setIsDeleteModalOpen(false);

        try {
            const { error } = await supabase.from('project_notes').delete().eq('id', noteToDelete);
            if (error) throw error;
            
            toast.success("Dokumen berhasil dihapus.");
            setNoteToDelete(null);
            router.refresh();
        } catch (error: any) {
            toast.error(`Gagal menghapus: ${error.message}`);
            setLocalNotes(originalNotes); // Rollback
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-8 p-1">
            <section>
                <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Article className="h-5 w-5" weight="fill" />
                        <h2 className="text-base font-semibold text-foreground tracking-tight">
                            Recent Documents (MoM & Reports)
                        </h2>
                    </div>
                    <Button variant="default" size="sm" onClick={handleAddNote} className="shadow-sm">
                        <Plus className="mr-1.5 h-4 w-4" weight="bold" />
                        New Document
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Spinner className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : recentNotes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {recentNotes.map((note) => (
                            <NoteCard key={note.id} note={note} onEdit={handleEditNote} onDelete={handleDeleteNote} onClick={() => handleNoteClick(note)} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        Belum ada dokumen atau laporan terbaru.
                    </div>
                )}
            </section>

            <section className="pt-4">
                <div className="mb-4 flex items-center gap-2 text-primary">
                    <Books className="h-5 w-5" weight="fill" />
                    <h2 className="text-base font-semibold text-foreground tracking-tight">
                        Project Logs Register
                    </h2>
                </div>
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-1">
                    <NotesTable notes={localNotes} onAddNote={handleAddNote} onEditNote={handleEditNote} onDeleteNote={handleDeleteNote} onNoteClick={handleNoteClick} />
                </div>
            </section>

            <CreateNoteModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} currentUser={currentUser} onCreateNote={handleCreateNote} onUploadAudio={handleUploadAudio} />
            <UploadAudioModal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} onFileSelect={handleFileSelect} />
            <NotePreviewModal open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} note={selectedNote} />

            <DeleteConfirmModal 
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={confirmDeleteNote}
                title="Hapus Catatan?"
                description="Apakah Bapak yakin ingin menghapus catatan ini? Data yang dihapus tidak bisa dikembalikan."
                isLoading={isDeleting}
            />
        </div>
    )
}