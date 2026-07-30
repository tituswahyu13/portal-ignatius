import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
  
  // Ensure consistent spacing between 'Rp' and the number for both server and client to avoid hydration mismatch
  return formatted.replace(/^Rp\s*/, 'Rp ');
}
