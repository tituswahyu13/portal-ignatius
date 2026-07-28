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
import { Button } from "@/components/ui/button";
import { bulkUpdatePermissions } from "./actions";
import { useState, Fragment, useMemo } from "react";
import { Save, XCircle, Loader2 } from "lucide-react";

export function RoleMatrix({
  roles,
  permissions,
  rolePermissions
}: {
  roles: any[],
  permissions: any[],
  rolePermissions: any[]
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [localPermissions, setLocalPermissions] = useState(
    rolePermissions.map(rp => `${rp.roleId}-${rp.permissionId}`)
  );
  const [stagedChanges, setStagedChanges] = useState<Record<string, boolean>>({});

  const moduleGroups = permissions.reduce((acc, curr) => {
    if (!acc[curr.appModule]) acc[curr.appModule] = [];
    acc[curr.appModule].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const handleToggle = (roleId: number, permissionId: number, checked: boolean) => {
    const key = `${roleId}-${permissionId}`;
    setStagedChanges(prev => {
      const next = { ...prev };
      const isOriginallyChecked = rolePermissions.some(rp => rp.roleId === roleId && rp.permissionId === permissionId);
      
      // If toggling back to original state, remove from staged
      if (isOriginallyChecked === checked) {
        delete next[key];
      } else {
        next[key] = checked;
      }
      return next;
    });

    if (checked) {
      setLocalPermissions(prev => [...prev, key]);
    } else {
      setLocalPermissions(prev => prev.filter(k => k !== key));
    }
  };

  const handleSaveBulk = async () => {
    if (Object.keys(stagedChanges).length === 0) return;
    setIsSaving(true);

    const changesPayload = Object.entries(stagedChanges).map(([key, isGranted]) => {
      const [roleId, permissionId] = key.split('-').map(Number);
      return { roleId, permissionId, isGranted };
    });

    const res = await bulkUpdatePermissions(changesPayload);
    setIsSaving(false);
    
    if (res.success) {
      setStagedChanges({});
    } else {
      alert("Gagal menyimpan perubahan: " + res.error);
    }
  };

  const cancelChanges = () => {
    setStagedChanges({});
    setLocalPermissions(rolePermissions.map(rp => `${rp.roleId}-${rp.permissionId}`));
  };

  const hasChanges = Object.keys(stagedChanges).length > 0;

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
          
          <Table wrapperClassName="max-h-[70vh]">
              <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
                <TableRow>
                  <TableHead className="w-[300px] sticky left-0 z-20 bg-card border-r">Hak Akses (Permission)</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center w-[160px] min-w-[160px] border-r">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {perms.map((perm, index) => {
                  const currentPrefix = perm.name.split('_')[0];
                  const previousPrefix = index > 0 ? perms[index - 1].name.split('_')[0] : null;
                  const showSeparator = currentPrefix !== previousPrefix;

                  return (
                    <Fragment key={perm.id}>
                      {showSeparator && (
                        <TableRow className="bg-muted/30">
                          <TableCell className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 z-10 bg-muted/90 shadow-[1px_0_0_0_hsl(var(--border))] border-r">
                            Kelompok: {currentPrefix}
                          </TableCell>
                          {roles.map(r => (
                            <TableCell key={r.id} className="bg-muted/30 border-r" />
                          ))}
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell className="sticky left-0 z-10 bg-card shadow-[1px_0_0_0_hsl(var(--border))] align-top border-r pt-5">
                          <div className="font-medium text-sm leading-none mb-1.5">{perm.name}</div>
                          <div className="text-[11px] text-muted-foreground leading-snug">{perm.description}</div>
                        </TableCell>
                        
                        {roles.map((role) => {
                          return (
                            <TableCell key={role.id} className="text-center align-top border-r pt-[22px]">
                              <div className="flex justify-center w-full">
                                <Checkbox 
                                  checked={isChecked(role.id, perm.id)}
                                  disabled={isSaving}
                                  onCheckedChange={(checked) => handleToggle(role.id, perm.id, checked as boolean)}
                                />
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
        </div>
      ))}

      {hasChanges && (
        <div className="sticky bottom-4 mx-auto max-w-fit rounded-full bg-slate-900 text-white px-6 py-4 flex items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-5 fade-in z-50">
          <div>
            <p className="font-semibold">{Object.keys(stagedChanges).length} perubahan belum disimpan</p>
            <p className="text-xs text-slate-300">Harap simpan sebelum meninggalkan halaman</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={cancelChanges} disabled={isSaving}>
              <XCircle className="w-4 h-4 mr-2" /> Batal
            </Button>
            <Button onClick={handleSaveBulk} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="bg-card p-6 rounded-xl shadow-2xl border flex flex-col items-center gap-4 max-w-sm text-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <div>
              <h4 className="font-semibold text-lg">Memproses Perubahan</h4>
              <p className="text-sm text-muted-foreground mt-1">Harap tunggu, sedang menyimpan hak akses, memperbarui audit log, dan membuat notifikasi...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
