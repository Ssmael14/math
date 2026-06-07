export const brand = {
  appName: "Paskalito",
  mascotName: "Paskalito",
  domain: "paskalito.com",
  supportEmail: "soporte@paskalito.com",
  tagline: "Matemáticas gamificadas para niños de 4 a 6 años",
  pwaName: "Paskalito · Aventura matemática",
  assets: {
    logo: "/brand/paskalito-logo.png",
    mark: "/brand/paskalito-mark.png",
    mascotHappy: "/brand/paskalito-mascot-happy.png",
    mascotCelebrate: "/brand/paskalito-mascot-celebrate.png",
    mascotSad: "/brand/paskalito-mascot-sad.png",
    mascotSleepy: "/brand/paskalito-mascot-sleepy.png",
    mascotTeach: "/brand/paskalito-mascot-teach.png",
  },
} as const;

export type Brand = typeof brand;
