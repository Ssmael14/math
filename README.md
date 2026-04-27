# LearnMath — Next.js + Prisma + Supabase

App gamificada de matemáticas para niños de 4-6 años con Lumi la llama 🦙.
**MVP técnico funcional** con auth real, DB y progreso persistente.

## Stack
- Next.js 15 (App Router, Server Components)
- TypeScript
- Tailwind CSS v4
- **Prisma 6** (ORM type-safe)
- **Supabase** (Auth + Postgres en prod)
- Postgres local via Docker (dev)

## 🚀 Setup local (5 min)

```bash
# 1. Instalar deps
cd learnmath-nextjs
npm install

# 2. Levantar Postgres local
docker compose up -d

# 3. Configurar env
cp .env.example .env.local
# → editar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
#   con los valores de tu proyecto Supabase (o dejá vacío para solo mockear)

# 4. Migraciones + seed
npm run db:migrate -- --name init
npm run db:seed

# 5. Correr
npm run dev
```

Abrí http://localhost:3000 → `/auth/login`.

## 📦 Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Server de desarrollo |
| `npm run db:migrate` | Aplicar cambios de schema |
| `npm run db:seed` | Cargar contenido (1 unidad · 3 lecciones · 10 ejercicios) |
| `npm run db:studio` | Abrir Prisma Studio (GUI para la DB) |
| `npm run db:reset` | Limpiar DB y reseedear |

## 🗺️ Arquitectura

```
learnmath-nextjs/
├── prisma/
│   ├── schema.prisma    # 7 modelos (User, Child, Unit, Lesson, Exercise, Attempt, Progress)
│   └── seed.ts          # Contenido inicial
├── lib/
│   ├── prisma.ts        # Singleton PrismaClient
│   ├── auth.ts          # Abstracción de auth (portable)
│   ├── queries.ts       # Queries de alto nivel
│   └── supabase/        # Clientes SSR
├── middleware.ts        # Protege rutas privadas
├── app/
│   ├── api/             # Route handlers (progress, attempts, children)
│   ├── auth/            # login, signup, forgot, callback
│   ├── home/            # Mapa de aventura (Server Component → datos reales)
│   ├── units/           # Lista de unidades
│   ├── lesson/[id]/     # Runner dinámico de ejercicios
│   └── ...              # Otras 20+ pantallas
└── components/          # Lumi, PhoneFrame, BottomNav, etc.
```

## 🔑 Pantallas conectadas a datos reales

- ✅ `/home` — lee unidad activa + progreso del child
- ✅ `/units` — lista todas las unidades con progreso
- ✅ `/lesson/[id]` — corre ejercicios reales, guarda attempts + progress
- ✅ `/victory` — recibe XP y estrellas reales via query params
- ✅ `/auth/*` — login, signup, forgot con Supabase Auth
- ✅ `/profile/create` — crea child via `/api/children`

## 🔄 Portabilidad (irte de Supabase algún día)

Toda la lógica de datos vive en **Prisma** — Supabase solo hace auth + Postgres hosting.

Para migrar a Neon / Railway / Render:
1. Cambiar `DATABASE_URL` a la nueva DB
2. Correr `npx prisma migrate deploy`
3. Reemplazar `lib/auth.ts` con NextAuth/Clerk/Lucia

**Cero refactor en pantallas ni API routes.**

## 🚢 Deploy

```bash
npx vercel
# + pegar env vars en el dashboard
```

## 📋 Próximos pasos

- [ ] PWA con `next-pwa` (instalable en el home del cel)
- [ ] Más unidades / ejercicios
- [ ] Panel padres con queries reales (hoy es mock)
- [ ] Analytics (PostHog)
- [ ] Stripe / RevenueCat para premium

## 🔐 COPPA

La app pide consentimiento de padre/madre en signup. Los datos del niño nunca están asociados a email directo del niño, solo al padre.
