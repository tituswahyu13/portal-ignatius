import { getUsers, getRoles, getLingkungan, getPermissions, getRolePermissions } from "@/lib/data/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateUserDialog } from "./create-user-dialog";
import { UserActionsMenu } from "./user-actions-menu";
import { RoleMatrix } from "./role-matrix";
import { UserFilters } from "./user-filters";

export const dynamic = "force-dynamic";

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: { search?: string; role?: string; status?: string };
}) {
  const roles = await getRoles();
  const lingkungan = await getLingkungan();
  const permissions = await getPermissions();
  const rolePermissions = await getRolePermissions();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen User</h2>
          <p className="text-muted-foreground">
            Kelola daftar pengguna, peran (role), dan hak akses sistem.
          </p>
        </div>
        <CreateUserDialog roles={roles} lingkungan={lingkungan} />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="roles">Hak Akses (RBAC)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserFilters roles={roles} />
          <div className="rounded-md border bg-card">
            <UserTable roles={roles} lingkungan={lingkungan} searchParams={searchParams} />
          </div>
        </TabsContent>
        
        <TabsContent value="roles">
          <RoleMatrix 
            roles={roles} 
            permissions={permissions} 
            rolePermissions={rolePermissions} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function UserTable({ roles, lingkungan, searchParams }: { roles: any[], lingkungan: any[], searchParams: any }) {
  let users = [];
  try {
    // Basic filter logic that should be handled in `getUsers` ideally,
    // but since we want to modify here without breaking other usages:
    let allUsers = await getUsers();
    
    // Apply filters
    users = allUsers.filter((u: any) => {
      let matchesSearch = true;
      let matchesRole = true;
      let matchesStatus = true;
      
      if (searchParams.search) {
        const term = searchParams.search.toLowerCase();
        matchesSearch = u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      }
      
      if (searchParams.role && searchParams.role !== "all") {
        matchesRole = u.userRoles.some((ur: any) => ur.roleId.toString() === searchParams.role);
      }
      
      if (searchParams.status && searchParams.status !== "all") {
        const wantActive = searchParams.status === "active";
        matchesStatus = u.isActive === wantActive;
      }
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  } catch (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Gagal mengambil data pengguna. Pastikan database telah berjalan dan
        seeder telah dieksekusi.
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Belum ada pengguna di database. Jalankan `npm run db:seed`.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-[200px]">Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telepon</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Lingkungan</TableHead>
          <TableHead className="text-right">Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phoneNumber || "-"}</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {user.userRoles.map((ur: any) => (
                  <Badge key={ur.role.id} variant="secondary" className="text-[10px]">
                    {ur.role.name}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>{user.lingkungan?.namaLingkungan || "-"}</TableCell>
            <TableCell className="text-right">
              {user.isActive ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">Aktif</Badge>
              ) : (
                <Badge variant="destructive">Tidak Aktif</Badge>
              )}
            </TableCell>
            <TableCell>
              <UserActionsMenu user={user} roles={roles} lingkungan={lingkungan} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
