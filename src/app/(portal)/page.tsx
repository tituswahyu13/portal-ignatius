import Link from "next/link";
import { Users, Wallet, UsersRound, Landmark } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const apps = [
  {
    name: "Manajemen User",
    description: "Kelola pengguna, role, dan hak akses portal.",
    href: "/usermanagement",
    icon: Users,
  },
  {
    name: "Dana Sosial Paroki",
    description: "Pengelolaan dana sosial, SPB, dan realisasi.",
    href: "/dansospar",
    icon: Wallet,
  },
  {
    name: "Data Umat",
    description: "Sistem data umat paroki.",
    href: "/dataumat",
    icon: UsersRound,
    comingSoon: true,
  },
  {
    name: "Keuangan Paroki",
    description: "Pengelolaan keuangan paroki.",
    href: "/keuangan",
    icon: Landmark,
    comingSoon: true,
  },
];

export default function PortalPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Selamat Datang</h2>
        <p className="mt-2 text-muted-foreground">
          Pilih aplikasi yang ingin Anda akses.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {apps.map((app) => {
          const Icon = app.icon;
          const content = (
            <Card
              className={`group relative h-full transition-all hover:shadow-md ${
                app.comingSoon
                  ? "cursor-not-allowed opacity-60"
                  : "hover:border-primary/50"
              }`}
            >
              <CardHeader>
                <div className="mb-2">
                  <Icon className="h-10 w-10 text-primary/80 transition-colors group-hover:text-primary" />
                </div>
                <CardTitle className="text-lg">{app.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {app.description}
                </CardDescription>
              </CardHeader>
              {app.comingSoon && (
                <div className="absolute right-4 top-4">
                  <Badge variant="secondary" className="font-medium text-xs">
                    Segera Hadir
                  </Badge>
                </div>
              )}
            </Card>
          );

          if (app.comingSoon) {
            return (
              <div key={app.href} className="block">
                {content}
              </div>
            );
          }

          return (
            <Link key={app.href} href={app.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
