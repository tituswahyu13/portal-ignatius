"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toggleRolePermissionAction } from "./actions";
import { useState } from "react";

export function RoleMatrix({
  roles,
  permissions,
  rolePermissions
}: {
  roles: any[],
  permissions: any[],
  rolePermissions: any[]
}) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  
  // State lokal untuk Optimistic UI (agar ceklis terasa instan)
  const [localPermissions, setLocalPermissions] = useState(
    rolePermissions.map(rp => `${rp.roleId}-${rp.permissionId}`)
  );

  // Kelompokkan permission berdasarkan appModule
  const moduleGroups = permissions.reduce((acc, curr) => {
    if (!acc[curr.appModule]) acc[curr.appModule] = [];
    acc[curr.appModule].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const handleToggle = async (roleId: number, permissionId: number, checked: boolean) => {
    const key = `${roleId}-${permissionId}`;
    
    // 1. Optimistic Update (Langsung ubah UI sebelum server merespon)
    if (checked) {
      setLocalPermissions(prev => [...prev, key]);
    } else {
      setLocalPermissions(prev => prev.filter(k => k !== key));
    }

    // 2. Kirim ke Server di background
    setLoadingIds((prev) => [...prev, key]);
    const res = await toggleRolePermissionAction(roleId, permissionId, checked);
    setLoadingIds((prev) => prev.filter(k => k !== key));
    
    // Jika gagal, kembalikan state UI seperti semula
    if (!res.success) {
      if (checked) {
        setLocalPermissions(prev => prev.filter(k => k !== key));
      } else {
        setLocalPermissions(prev => [...prev, key]);
      }
    }
  };

  const isChecked = (roleId: number, permissionId: number) => {
    return localPermissions.includes(`${roleId}-${permissionId}`);
  };

  return (
    <div className="space-y-8">
      {Object.entries(moduleGroups).map(([moduleName, perms]) => (
        <div key={moduleName} className="rounded-md border bg-card">
          <div className="p-4 bg-muted/30 border-b">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Modul: <Badge variant="outline">{moduleName}</Badge>
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Hak Akses (Permission)</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-[120px]">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {perms.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{perm.name}</div>
                      <div className="text-[11px] text-muted-foreground">{perm.description}</div>
                    </TableCell>
                    
                    {roles.map((role) => {
                      const loadingKey = `${role.id}-${perm.id}`;
                      const isLoading = loadingIds.includes(loadingKey);
                      
                      return (
                        <TableCell key={role.id} className="text-center">
                          <Checkbox 
                            checked={isChecked(role.id, perm.id)}
                            disabled={isLoading}
                            onCheckedChange={(checked) => handleToggle(role.id, perm.id, checked as boolean)}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
