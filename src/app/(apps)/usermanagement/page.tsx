import { getUsers } from "@/lib/data/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function UserManagementPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen User</h2>
          <p className="text-muted-foreground">
            Kelola daftar pengguna, peran (role), dan hak akses sistem.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <UserTable />
      </div>
    </div>
  );
}

async function UserTable() {
  let users = [];
  try {
    users = await getUsers();
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
                {user.userRoles.map((ur) => (
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
