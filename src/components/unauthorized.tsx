import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";

export function Unauthorized() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        Akses Ditolak
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Maaf, Anda tidak memiliki hak akses (permission) yang dibutuhkan untuk membuka halaman ini. Silakan hubungi Administrator jika Anda merasa ini adalah sebuah kesalahan.
      </p>
      <Button asChild>
        <Link href="/">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}
