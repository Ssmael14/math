import type { Metadata, Viewport } from "next";
import { Fraunces, Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { brand } from "@/lib/brand";

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

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: `${brand.appName} — Aventura con ${brand.mascotName}`,
  description: brand.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brand.appName,
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
  themeColor: "#4867F5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${nunito.variable} ${fraunces.variable}`}
    >
      <body className="bg-cream text-ink">
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
