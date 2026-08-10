"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardDataUmat() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat Statistik...</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Demografi Umat</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Data Umat
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUmat.toLocaleString()} Jiwa</div>
            <p className="text-xs text-muted-foreground">
              Terdaftar dalam database
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Gender Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rasio Jenis Kelamin</CardTitle>
            <CardDescription>Berdasarkan Laki-laki dan Perempuan</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.genderStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.genderStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Jiwa`, 'Jumlah']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kelompok Usia</CardTitle>
            <CardDescription>Demografi rentang umur umat</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageStats} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-25} textAnchor="end" />
                <YAxis width={60} />
                <Tooltip formatter={(value) => [`${value} Jiwa`, 'Jumlah']} />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} name="Jumlah Umat" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Education Bar Chart (Horizontal) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Latar Belakang Pendidikan</CardTitle>
          </CardHeader>
          <CardContent style={{ height: Math.max(350, stats.eduStats.length * 35) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.eduStats} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} interval={0} />
                <Tooltip formatter={(value) => [`${value} Jiwa`, 'Jumlah']} />
                <Bar dataKey="value" fill="#00C49F" radius={[0, 4, 4, 0]} name="Jumlah Umat" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lingkungan Stats (if Global) */}
        {stats.isGlobal && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sebaran per Lingkungan</CardTitle>
              <CardDescription>Distribusi umat di masing-masing lingkungan</CardDescription>
            </CardHeader>
            <CardContent style={{ height: Math.max(400, stats.lingkunganStats.length * 35) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats.lingkunganStats} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={180} tick={{fontSize: 12}} interval={0} />
                  <Tooltip formatter={(value) => [`${value} Jiwa`, 'Jumlah']} />
                  <Bar dataKey="value" fill="#FFBB28" radius={[0, 4, 4, 0]} name="Jumlah Umat" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
