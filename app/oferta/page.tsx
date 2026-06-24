import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { OfertaClient } from "./OfertaClient";

export const metadata: Metadata = {
  title: `Oferta de lanzamiento · ${brand.appName}`,
  description:
    "Activa Paskalito Premium por WhatsApp y Yape. Cursos visuales de matemática y lectura para niños.",
};

export default function OfertaPage() {
  return <OfertaClient />;
}
