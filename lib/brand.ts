import { brandAssets } from "./brand-assets.generated";

export const brand = {
  appName: "Paskalito",
  mascotName: "Paskalito",
  domain: "paskalito.com",
  supportEmail: "soporte@paskalito.com",
  whatsappNumber: "51921461462",
  tagline: "Matemáticas gamificadas para niños de 4 a 6 años",
  pwaName: "Paskalito · Aventura matemática",
  assets: brandAssets,
} as const;

export type Brand = typeof brand;
