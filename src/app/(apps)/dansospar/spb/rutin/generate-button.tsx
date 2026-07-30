"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle } from "lucide-react";
import { generateMonthlyRoutineSpbAction } from "./actions";

export function GenerateRoutineButton({ 
  canGenerate, 
  monthStr,
  ungeneratedCount 
}: { 
  canGenerate: boolean, 
  monthStr: string,
  ungeneratedCount: number 
}) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!confirm(`Anda akan meng-generate ${ungeneratedCount} SPB Rutin untuk bulan ${monthStr}. SPB ini akan langsung berstatus REALIZED dan memotong saldo kas. Lanjutkan?`)) {
      return;
    }

    setLoading(true);
    const result = await generateMonthlyRoutineSpbAction(monthStr);
    
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={!canGenerate || loading}
      className="bg-primary hover:bg-primary/90"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <PlayCircle className="h-4 w-4 mr-2" />
      )}
      {canGenerate ? `Generate SPB ${monthStr} (${ungeneratedCount})` : `Semua SPB ${monthStr} Selesai`}
    </Button>
  );
}
