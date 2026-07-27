import { getSpbFormData } from "../actions";
import { CreateSpbForm } from "./create-spb-form";

export const dynamic = "force-dynamic";

export default async function CreateSpbPage() {
  const { lingkungans, intensis } = await getSpbFormData();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Formulir Pengajuan SPB</h2>
        <p className="text-muted-foreground">
          Lengkapi data di bawah ini untuk mengajukan Surat Permohonan Bantuan Dana Sosial Paroki.
        </p>
      </div>

      <CreateSpbForm lingkungans={lingkungans} intensis={intensis} />
    </div>
  );
}
