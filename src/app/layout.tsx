import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { THEME_COLORS, THEME_SCRIPT } from "@/lib/theme";
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
  // El script de tema la cambia al color oscuro cuando corresponde.
  themeColor: THEME_COLORS.light,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `suppressHydrationWarning`: el script agrega `.dark` a <html> antes de hidratar.
    <html lang="es" className={`${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
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
