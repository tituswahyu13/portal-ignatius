"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateSpbStatusAction } from "../actions";

const STATUS_FLOW = [
  { value: "SUBMITTED", label: "Diajukan (Menunggu Review)" },
  { value: "REVIEW_PIC", label: "Sedang Direview PIC" },
  { value: "APPROVED_TPDSP", label: "Disetujui TPDSP" },
  { value: "APPROVED_PASTOR", label: "Disahkan Romo Paroki" },
  { value: "REALIZED", label: "Realisasi Dana (Final)" },
];

export function SpbStatusManager({ spbId, currentStatus }: { spbId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleUpdate = async (newStatus: string) => {
    if (newStatus === "REALIZED") {
      if (!confirm("PERINGATAN: Mengubah status ke REALIZED akan memotong saldo Kas Intensi secara permanen. Lanjutkan?")) return;
    }
    
    setLoading(true);
    const result = await updateSpbStatusAction(BigInt(spbId), newStatus);
    if (!result.success) {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (confirm("Yakin ingin menolak SPB ini?")) {
      setLoading(true);
      await updateSpbStatusAction(BigInt(spbId), "REJECTED");
      setLoading(false);
    }
  };

  if (currentStatus === "REALIZED") {
    return <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center font-bold">Dana Telah Direalisasikan</div>;
  }

  if (currentStatus === "REJECTED") {
    return <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-center font-bold">Pengajuan Ditolak</div>;
  }

  const currentIndex = STATUS_FLOW.findIndex(s => s.value === currentStatus);
  const nextStatus = STATUS_FLOW[currentIndex + 1];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {nextStatus && (
          <Button 
            className="flex-1 bg-primary" 
            onClick={() => handleUpdate(nextStatus.value)}
            disabled={loading}
          >
            Lanjutkan ke: {nextStatus.label}
          </Button>
        )}
        <Button variant="destructive" onClick={handleReject} disabled={loading}>
          Tolak SPB
        </Button>
      </div>
    </div>
  );
}
