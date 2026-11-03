import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mis Gastos",
  description: "Registra tus ingresos y gastos y revisa tu resumen mensual.",
  appleWebApp: { capable: true, title: "Mis Gastos", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#F3F4F1",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-canvas text-ink">
        <div className="lg:flex">
          <Sidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
