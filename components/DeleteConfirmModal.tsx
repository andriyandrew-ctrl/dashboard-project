"use client"

import { Trash, WarningCircle, X } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type DeleteConfirmModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  isLoading?: boolean
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Hapus Item?",
  description = "Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari database.",
  isLoading = false
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-destructive/5 p-6 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <WarningCircle className="h-8 w-8 text-destructive" weight="fill" />
            </div>
            <DialogHeader className="p-0">
                <DialogTitle className="text-xl font-bold text-foreground text-center">
                    {title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-center mt-2 leading-relaxed">
                    {description}
                </DialogDescription>
            </DialogHeader>
        </div>

        <div className="p-4 bg-muted/20 flex flex-col sm:flex-row gap-2 justify-center border-t border-border/50">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 font-semibold hover:bg-muted"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 font-semibold shadow-sm shadow-destructive/20"
          >
            {isLoading ? "Menghapus..." : "Ya, Hapus Sekarang"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
