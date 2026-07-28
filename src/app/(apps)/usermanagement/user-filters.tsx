"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function UserFilters({ roles }: { roles: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleRoleFilter = (roleId: string) => {
    const params = new URLSearchParams(searchParams);
    if (roleId && roleId !== "all") {
      params.set("role", roleId);
    } else {
      params.delete("role");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari pengguna berdasarkan nama atau email..."
          className="pl-8"
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(e) => {
            // Debounce in a real app, for now simple timeout
            const handler = setTimeout(() => handleSearch(e.target.value), 300);
            return () => clearTimeout(handler);
          }}
        />
      </div>
      <div className="flex gap-4">
        <Select 
          defaultValue={searchParams.get("role")?.toString() || "all"} 
          onValueChange={handleRoleFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          defaultValue={searchParams.get("status")?.toString() || "all"} 
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
