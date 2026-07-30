"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface ChartData {
  name: string;
  regular: number;
  rutin: number;
}

interface DashboardChartProps {
  data: ChartData[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border bg-card text-muted-foreground mt-8">
        Belum ada data SPB yang cukup untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow mt-8">
      <div className="p-6">
        <h3 className="tracking-tight text-lg font-semibold">Statistik Pencairan SPB (6 Bulan Terakhir)</h3>
        <p className="text-sm text-muted-foreground mb-6">Perbandingan SPB Reguler dan Rutin berdasarkan total dana pencairan (dalam Rupiah).</p>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}Jt`}
                width={70}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={(value: number) => formatRupiah(value)} 
                tick={{ fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number, name: string) => [
                  formatRupiah(value), 
                  name
                ]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="regular" name="SPB Reguler" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="rutin" name="SPB Rutin" fill="#ea580c" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
