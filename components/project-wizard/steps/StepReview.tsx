import { PencilSimpleLine, Target, TrendUp, UsersThree, TreeStructure } from "@phosphor-icons/react/dist/ssr";
import { formatTargetProduksi, formatTargetRevenue } from "@/lib/utils";
import type { ProjectData } from "../types";

type StepReviewProps = { data: ProjectData; onEditStep: (step: number) => void; };

export function StepReview({ data, onEditStep }: StepReviewProps) {
  const intentLabels = { delivery: "Delivery", experiment: "Eksperimen", internal: "Internal" };
  const structureLabels = { linear: "Linear", milestone: "Milestone-based", multistream: "Multi-stream" };
  const priorityLabels = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <p className="text-sm text-muted-foreground">Silakan periksa detail proyek. Jika sudah sesuai, klik <strong>Simpan Proyek</strong>.</p>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-4">
        {/* REVIEW STEP 1 */}
        <div className="rounded-xl border border-border bg-background p-4 relative group hover:border-primary/30">
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm"><Target className="h-4 w-4" /> 1. Detail Proyek</div>
            <button onClick={() => onEditStep(1)} className="text-muted-foreground hover:text-primary"><PencilSimpleLine className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <div className="text-muted-foreground">Judul Proyek</div>
            <div className="font-medium text-foreground">{data.name || <span className="text-red-500 italic">Belum diisi</span>}</div>
            <div className="text-muted-foreground">Prioritas</div>
            <div className="font-medium text-foreground capitalize">{data.priority ? priorityLabels[data.priority] : "Medium"}</div>
            <div className="text-muted-foreground">Lokasi</div>
            <div className="font-medium text-foreground">
              {data.city || data.province ? `${data.city}${data.city && data.province ? ', ' : ''}${data.province}` : "-"}
            </div>
            <div className="text-muted-foreground">Kategori</div>
            <div className="font-medium text-foreground">{data.intent ? intentLabels[data.intent] : "-"}</div>
          </div>
        </div>

        {/* REVIEW STEP 2 */}
        <div className="rounded-xl border border-border bg-background p-4 relative group hover:border-primary/30">
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm"><TrendUp className="h-4 w-4" /> 2. Target & Scope</div>
            <button onClick={() => onEditStep(2)} className="text-muted-foreground hover:text-primary"><PencilSimpleLine className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <div className="text-muted-foreground">Deadline</div>
            <div className="font-medium text-foreground">{data.targetDeadline || "-"}</div>
            <div className="text-muted-foreground">Target Produksi</div>
            <div className="font-medium text-primary uppercase text-[11px] font-bold">{formatTargetProduksi(data.targetProduksi)}</div>
            <div className="text-muted-foreground">Target Revenue</div>
            <div className="font-medium text-emerald-600 uppercase text-[11px] font-bold">{formatTargetRevenue(data.targetRevenue)}</div>
            <div className="text-muted-foreground">In Scope</div>
            <div className="font-medium text-emerald-600 line-clamp-1">{data.inScope ? data.inScope.split('\n').join(', ') : "-"}</div>
            <div className="text-muted-foreground">Out of Scope</div>
            <div className="font-medium text-orange-600 line-clamp-1">{data.outOfScope ? data.outOfScope.split('\n').join(', ') : "-"}</div>
          </div>
        </div>

        {/* REVIEW STEP 3 */}
        <div className="rounded-xl border border-border bg-background p-4 relative group hover:border-primary/30">
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm"><UsersThree className="h-4 w-4" /> 3. PIC & Partner</div>
            <button onClick={() => onEditStep(3)} className="text-muted-foreground hover:text-primary"><PencilSimpleLine className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <div className="text-muted-foreground">PIC Internal</div>
            <div className="font-medium text-foreground">{data.pic || <span className="text-red-500 italic">Belum diisi</span>}</div>
            <div className="text-muted-foreground">Partner / Mitra</div>
            <div className="font-medium text-foreground">{data.partner || "-"}</div>
            <div className="text-muted-foreground">Client / Pemilik</div>
            <div className="font-medium text-foreground">{data.client || "-"}</div>
          </div>
        </div>

        {/* REVIEW STEP 4 */}
        <div className="rounded-xl border border-border bg-background p-4 relative group hover:border-primary/30">
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm"><TreeStructure className="h-4 w-4" /> 4. Struktur Kerja</div>
            <button onClick={() => onEditStep(4)} className="text-muted-foreground hover:text-primary"><PencilSimpleLine className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <div className="text-muted-foreground">Metode Kerja</div>
            <div className="font-medium text-foreground">{data.structure ? structureLabels[data.structure] : "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}