export const brand = {
  appName: "Paskalito",
  mascotName: "Paskalito",
  domain: "paskalito.com",
  supportEmail: "soporte@paskalito.com",
  tagline: "Matemáticas gamificadas para niños de 4 a 6 años",
  pwaName: "Paskalito · Aventura matemática",
  assets: {
    logo: "/brand/paskalito-logo.svg",
    mark: "/brand/paskalito-mark.svg",
    mascotHappy: "/brand/paskalito-mascot-happy.svg",
    mascotCelebrate: "/brand/paskalito-mascot-celebrate.svg",
    mascotSad: "/brand/paskalito-mascot-sad.svg",
    mascotSleepy: "/brand/paskalito-mascot-sleepy.svg",
    mascotTeach: "/brand/paskalito-mascot-teach.svg",
  },
} as const;

export type Brand = typeof brand;
