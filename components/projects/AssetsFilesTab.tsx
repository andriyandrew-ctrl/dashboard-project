"use client";

import { useState, useRef, useEffect } from "react";
import { File, FilePdf, Image as ImageIcon, Trash, DownloadSimple, Plus, Spinner } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadFileToStorage, addFileToDB, deleteFileAction } from "@/lib/data/project-actions";
import { useRouter } from "next/navigation";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

type FileItem = {
  id: string;
  name: string;
  type: string;
  sizeMB: number;
  url: string;
  addedBy: any;
  addedDate: Date;
};

export function AssetsFilesTab({ projectId, files: initialFiles, user }: { projectId: string; files: FileItem[]; user?: { id: string; name: string } }) {
  const [files, setFiles] = useState<FileItem[]>(initialFiles || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{id: string, url: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sync state when props change
  useEffect(() => {
    setFiles(initialFiles || []);
  }, [initialFiles]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // VALIDASI UKURAN FILE (MAKS 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      toast.error("Ukuran file terlalu besar! Maksimal 50MB.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Sedang mengupload file...");
    try {
      // 1. Upload fisik ke Storage (Gunakan FormData untuk Server Action)
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const publicUrl = await uploadFileToStorage(formData, projectId);
      
      // 2. Simpan metadata ke Database
      const rawExt = selectedFile.name.split('.').pop()?.toLowerCase() || "file";
      const newFileDB = await addFileToDB({
        project_id: projectId,
        name: selectedFile.name,
        type: rawExt,
        size_mb: Number((selectedFile.size / (1024 * 1024)).toFixed(2)),
        url: publicUrl,
        added_by: user || { id: "system", name: "System" }
      });

      toast.dismiss(loadingToast);
      toast.success("File berhasil diunggah!");
      router.refresh();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Gagal mengunggah: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string, url: string) => {
    setFileToDelete({ id, url });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteFileAction(fileToDelete.id, fileToDelete.url);
      toast.success("File berhasil dihapus.");
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
      router.refresh();
    } catch (error: any) {
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('pdf')) return <FilePdf className="h-8 w-8 text-red-500" weight="duotone" />;
    if (type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('image')) 
        return <ImageIcon className="h-8 w-8 text-emerald-500" weight="duotone" />;
    return <File className="h-8 w-8 text-slate-500" weight="duotone" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Repository Document</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Upload RAB, gambar DWG, spesifikasi teknis, atau kontrak kerja di sini (Maks 50MB).</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.jpg,.jpeg,.png,.zip" 
        />
        
        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-9 px-4 rounded-lg shadow-sm">
          {isUploading ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" weight="bold" />}
          {isUploading ? "Mengunggah..." : "Upload File"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <File className="h-6 w-6 text-muted-foreground opacity-50" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Belum ada dokumen yang diunggah.</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="group relative flex items-start gap-4 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:border-primary/30">
              <div className="shrink-0 pt-1">{getIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground truncate leading-snug" title={file.name}>{file.name}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span className="font-medium bg-muted px-1.5 py-0.5 rounded uppercase">{file.type}</span>
                  <span>•</span>
                  <span>{file.sizeMB} MB</span>
                </div>
              </div>
              
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-card/80 backdrop-blur-sm p-1 rounded-lg border border-border shadow-sm">
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => window.open(file.url, '_blank')} title="Download / Buka File">
                  <DownloadSimple className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(file.id, file.url)} title="Hapus File">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <DeleteConfirmModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDeleteFile}
        title="Hapus File?"
        description="Apakah Bapak yakin ingin menghapus file ini dari storage? File yang sudah dihapus tidak bisa diakses kembali."
        isLoading={isDeleting}
      />
    </div>
  );
}