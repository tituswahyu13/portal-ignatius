import { Suspense } from "react";
import { getSemuaDataUmat } from "./actions";
import { getLingkungans } from "./lingkungan/actions";
import { CreateUmatDialog } from "./create-umat-dialog";
import { UmatTable } from "./umat-table";
import { getLingkunganRestriction } from "@/lib/auth/permissions";

export default async function DataUmatPage() {
  const restriction = await getLingkunganRestriction();
  const lingkungans = await getLingkungans();
  const dataUmatList = await getSemuaDataUmat();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Umat</h1>
          <p className="text-muted-foreground">
            {restriction.restricted 
              ? `Kelola data umat untuk lingkungan Anda.`
              : `Kelola master data umat seluruh paroki.`}
          </p>
        </div>
        <CreateUmatDialog 
          lingkungans={lingkungans} 
          userLingkunganId={restriction.restricted ? restriction.lingkunganId : null}
          isRestricted={restriction.restricted}
        />
      </div>

      <UmatTable 
        dataUmatList={dataUmatList}
        lingkungans={lingkungans}
        isRestricted={restriction.restricted}
        userLingkunganId={restriction.restricted ? restriction.lingkunganId : null}
      />
    </div>
  );
}
