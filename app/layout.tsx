import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "LearnMath — Aventura con Lumi",
  description: "Matemáticas gamificadas para niños de 4–6 años",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LearnMath",
  },
};

// Viewport optimizado para mobile:
// - viewport-fit=cover → usa las áreas del notch (safe-area-inset)
// - user-scalable=no → evita zoom accidental con double-tap en kids
// - themeColor → color de la barra del browser al instalar como PWA
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFF9F0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="bg-cream text-ink">{children}</body>
    </html>
  );
}
