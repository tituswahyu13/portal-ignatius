import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal Ignatius - Paroki St. Ignatius Magelang",
  description:
    "Portal terpadu untuk pengelolaan dana sosial, data umat, dan keuangan Paroki St. Ignatius Magelang.",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ignatius",
  },
};

export const viewport = {
  themeColor: "#1e293b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
