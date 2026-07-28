import { db as prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getLingkunganRestriction } from "@/lib/auth/permissions";
import { getSpbFormData } from "../../actions";
import { EditSpbForm } from "./edit-spb-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditSpbPage({ params }: { params: { id: string } }) {
  const spbId = BigInt(params.id);
  
  const spb = await prisma.spbRequest.findUnique({
    where: { id: spbId }
  });

  if (!spb) {
    notFound();
  }

  if (spb.status !== "SUBMITTED") {
    redirect(`/dansospar/spb/${spbId.toString()}`);
  }

  const { lingkungans, intensis } = await getSpbFormData();
  const restriction = await getLingkunganRestriction();

  if (restriction.restricted && restriction.lingkunganId !== spb.lingkunganId) {
    redirect("/dansospar/spb");
  }

  const serializedSpb = {
    ...spb,
    id: spb.id.toString(),
    kpsId: spb.kpsId?.toString(),
    umkmId: spb.umkmId?.toString(),
    totalBiaya: spb.totalBiaya.toString(),
    danaSwadaya: spb.danaSwadaya.toString(),
    danaLingkungan: spb.danaLingkungan.toString(),
    danaParokiRequested: spb.danaParokiRequested.toString(),
    danaKevikepanRequested: spb.danaKevikepanRequested.toString(),
    createdBy: spb.createdBy.toString(),
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dansospar/spb">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Pengajuan SPB</h2>
          <p className="text-muted-foreground">
            Ubah data Surat Permohonan Bantuan untuk Nomor: {spb.nomorSpb}
          </p>
        </div>
      </div>

      <EditSpbForm 
        lingkungans={lingkungans} 
        intensis={intensis} 
        restriction={restriction} 
        initialData={serializedSpb} 
      />
    </div>
  );
}
