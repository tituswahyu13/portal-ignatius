"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { updateSpbStatusAction } from "../actions";

const STATUS_FLOW = [
  { value: "SUBMITTED", label: "Diajukan (Menunggu Review)" },
  { value: "REVIEW_PIC", label: "Ketua PSE" },
  { value: "APPROVED_TPDSP", label: "Ketua Dansospar" },
  { value: "APPROVED_PASTOR", label: "Romo Paroki" },
  { value: "REALIZED", label: "Realisasi Dana (Final)" },
];

export function SpbStatusManager({
  spbId,
  currentStatus,
  canReviewPic = false,
  canApproveTpdsp = false,
  canApprovePastor = false,
  canRealize = false,
  danaRequested = 0,
  danaApproved,
  initialRekomendasi = false
}: {
  spbId: string;
  currentStatus: string;
  canReviewPic?: boolean;
  canApproveTpdsp?: boolean;
  canApprovePastor?: boolean;
  canRealize?: boolean;
  danaRequested?: number;
  danaApproved?: number;
  initialRekomendasi?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDanaApproved, setCurrentDanaApproved] = useState<number>(danaApproved || danaRequested);
  const [rekomendasi, setRekomendasi] = useState<boolean>(initialRekomendasi);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRealizeDialogOpen, setIsRealizeDialogOpen] = useState(false);

  const handleUpdate = async (newStatus: string) => {

    setLoading(true);
    let payload;
    if (newStatus === "APPROVED_TPDSP") {
      payload = { danaApproved: currentDanaApproved, rekomendasi };
    }

    const result = await updateSpbStatusAction(BigInt(spbId), newStatus, payload);
    if (!result.success) {
      alert(result.error);
    } else {
      setIsDialogOpen(false);
      setIsRealizeDialogOpen(false);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Alasan penolakan harus diisi.");
      return;
    }
    setLoading(true);
    const result = await updateSpbStatusAction(BigInt(spbId), "REJECTED", { rejectionReason });
    if (!result.success) {
      alert(result.error);
    } else {
      setIsRejectDialogOpen(false);
    }
    setLoading(false);
  };

  if (currentStatus === "REALIZED") {
    return <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center font-bold">Dana Telah Direalisasikan</div>;
  }

  if (currentStatus === "REJECTED") {
    return <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-center font-bold">Pengajuan Ditolak</div>;
  }

  const currentIndex = STATUS_FLOW.findIndex(s => s.value === currentStatus);
  const nextStatus = STATUS_FLOW[currentIndex + 1];

  let hasPermissionForNextStatus = false;
  if (currentStatus === "SUBMITTED" && canReviewPic) hasPermissionForNextStatus = true;
  else if (currentStatus === "REVIEW_PIC" && canApproveTpdsp) hasPermissionForNextStatus = true;
  else if (currentStatus === "APPROVED_TPDSP" && canApprovePastor) hasPermissionForNextStatus = true;
  else if (currentStatus === "APPROVED_PASTOR" && canRealize) hasPermissionForNextStatus = true;

  const canEditCurrentStatus = currentStatus === "APPROVED_TPDSP" && canApproveTpdsp;

  if (!hasPermissionForNextStatus && !canEditCurrentStatus) {
    return (
      <div className="p-4 bg-muted/50 text-muted-foreground border rounded-lg text-center text-sm">
        Menunggu tindakan dari pihak berwenang.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {hasPermissionForNextStatus && nextStatus && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-auto whitespace-normal py-2 text-center"
            onClick={() => {
              if (nextStatus.value === "APPROVED_TPDSP") {
                setIsDialogOpen(true);
              } else if (nextStatus.value === "REALIZED") {
                setIsRealizeDialogOpen(true);
              } else {
                handleUpdate(nextStatus.value);
              }
            }}
            disabled={loading}
          >
            Persetujuan: {nextStatus.label}
          </Button>
        )}
        
        {hasPermissionForNextStatus && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setIsRejectDialogOpen(true)}
            disabled={loading}
          >
            Tolak SPB
          </Button>
        )}
      </div>

      {!hasPermissionForNextStatus && currentStatus === "APPROVED_TPDSP" && canApproveTpdsp && (
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => setIsDialogOpen(true)}
          disabled={loading}
        >
          Edit Nominal Disetujui
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Persetujuan Ketua Dansospar (TPDSP)</DialogTitle>
            <DialogDescription>
              Silakan masukkan nominal dana paroki yang disetujui dan rekomendasi ke tingkat kevikepan jika diperlukan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nominal Dana Disetujui (Rp)</Label>
              <Input
                type="number"
                value={currentDanaApproved}
                onChange={(e) => setCurrentDanaApproved(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rekomendasi"
                checked={rekomendasi}
                onCheckedChange={(checked) => setRekomendasi(checked === true)}
              />
              <Label htmlFor="rekomendasi">
                Rekomendasikan ke Tingkat Kevikepan
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={() => handleUpdate("APPROVED_TPDSP")} disabled={loading}>
              Konfirmasi Persetujuan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan SPB</DialogTitle>
            <DialogDescription>
              Silakan berikan alasan mengapa pengajuan SPB ini ditolak. Alasan ini akan dapat dilihat oleh pemohon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Alasan Penolakan</Label>
              <Textarea
                placeholder="Tuliskan alasan penolakan di sini..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading || !rejectionReason.trim()}>
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRealizeDialogOpen} onOpenChange={setIsRealizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Konfirmasi Realisasi Dana
            </DialogTitle>
            <DialogDescription className="font-medium text-foreground mt-2">
              Apakah Anda yakin ingin merealisasikan pengajuan ini?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              <span className="font-bold">PERINGATAN: </span> 
              Tindakan ini akan memotong saldo Kas Intensi secara permanen sejumlah 
              <span className="font-bold block text-2xl mt-2 mb-1">Rp {(danaApproved || danaRequested).toLocaleString('id-ID')}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pastikan uang sudah ditransfer atau diserahkan sebelum melakukan konfirmasi. Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRealizeDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={() => handleUpdate("REALIZED")} disabled={loading}>
              {loading ? "Memproses..." : "Ya, Potong Saldo & Realisasikan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
