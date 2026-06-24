import type { Metadata, Viewport } from "next";
import { Fraunces, Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { MetaPixel } from "@/components/analytics/MetaPixel";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BETTER_AUTH_URL ||
  `https://${brand.domain}`;
const defaultTitle = `${brand.appName} - Aventura con ${brand.mascotName}`;
const ogImage = "/og-image.png";
const configuredMetaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const metaPixelId =
  configuredMetaPixelId && /^\d+$/.test(configuredMetaPixelId)
    ? configuredMetaPixelId
    : null;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brand.appName,
  title: {
    default: defaultTitle,
    template: `%s · ${brand.appName}`,
  },
  description: brand.tagline,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brand.appName,
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: brand.appName,
    title: defaultTitle,
    description: brand.tagline,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${brand.appName} - ${brand.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: brand.tagline,
    images: [ogImage],
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
        {metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        <MetaPixel />
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
