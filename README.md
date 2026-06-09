# Paskalito - Plan de continuidad

Este README queda como nota operativa del proyecto para no perder el hilo entre iteraciones.

## Estado actual

- Producto: `Paskalito`.
- Personaje publico: `Paskalito`.
- Configuracion central de marca: `lib/brand.ts`.
- Assets generados base: `public/brand/`.
- Iconos PWA actualizados: `public/icon-192.png`, `public/icon-512.png`.
- Manifest actualizado: `public/manifest.webmanifest`.
- El codigo interno todavia conserva nombres como `Lumi.tsx`, `use-lumi-variant.ts` y builder `lumi(...)` para evitar un refactor grande.

## Plan inmediato

1. Hacer commit del cambio de identidad visual.
2. Ejecutar el seed de contenido no destructivo:

```bash
npm run db:seed:content
```

3. Revisar manualmente:

- `/auth/login`
- `/auth/signup`
- `/home`
- `/subjects`
- `/paths/math-initial-nel`
- `/lesson/[id]`
- `/victory`
- `/profile`
- `/shop`
- `/premium`

4. Confirmar que no queden textos visibles con `Lumi`:

```bash
rg "Aventura con Lumi|Tienda de Lumi|Aprendamos con Lumi|Mira y escucha a Lumi|Lumi te|Lumi quiere|Lumi se|Lumi esta" app components lib prisma public
```

## Assets pendientes

Los PNG actuales son la primera version generada de Paskalito. Falta pulir la identidad final:

- Logo horizontal `Paskalito + isotipo`.
- Isotipo solo.
- Mascota happy.
- Mascota celebrate.
- Mascota sad.
- Mascota sleepy.
- Mascota teaching/thinking.
- Iconos PWA finales en SVG/PNG.
- Favicon y Apple touch icon.
- Iconos UI: premium, gemas, corazones, racha, nodos de leccion, materias.

## Cloudinary

Regla para imagenes:

- Shell minimo de marca y PWA: local en `public`.
- `logo`, `mark`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`,
  `og-image.png`, manifest y service worker: locales.
- Imagenes dinamicas, generadas, subidas por admin o reemplazables sin deploy: Cloudinary.
- Mascotas, materias, caminos, ejercicios y banners: Cloudinary.
- No guardar imagenes subidas por usuarios en `public`.
- No exponer `CLOUDINARY_API_SECRET` al cliente.

Variables necesarias:

```bash
NEXT_PUBLIC_SITE_URL=""
CLOUDINARY_URL=""
# o, si no se usa CLOUDINARY_URL:
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
CLOUDINARY_UPLOAD_FOLDER="paskalito/uploads"
```

Endpoint server-side para firmar uploads directos:

```txt
POST /api/admin/cloudinary/sign-upload
```

Solo admins definidos en `ADMIN_EMAILS` pueden usarlo. Devuelve `cloudName`,
`apiKey`, `timestamp`, `folder`, `signature`, `uploadUrl`, `tags` y `context`.
Con esos datos el cliente puede subir directo a Cloudinary sin conocer el
secret.

Pantalla admin disponible:

```txt
/admin/assets
```

Permite subir una imagen, elegir carpeta dentro de `paskalito/`, previsualizar
el resultado y copiar la URL segura de Cloudinary.

Subida automatica de assets visuales:

```bash
npm run cloudinary:upload-brand-assets
```

Este comando sube los assets visuales dinamicos de `public/brand` a Cloudinary,
mantiene `logo` y `mark` locales, actualiza `lib/brand-assets.generated.ts` y
escribe un manifiesto solo de URLs remotas en
`public/brand/cloudinary-assets.json`.

## Refactor interno opcional

Cuando la identidad visual este aprobada, hacer una fase tecnica para renombrar internamente:

- `components/Lumi.tsx` -> `components/Mascot.tsx` o `components/Paskalito.tsx`.
- `lib/use-lumi-variant.ts` -> `lib/use-mascot-variant.ts`.
- `lumi(...)` en seeds -> `teach(...)` o `mascotTeach(...)`.
- Comentarios internos "Momento Lumi" -> "Momento Paskalito" o "Momento del personaje".

Esto no es urgente. Primero conviene estabilizar la marca visible.

## Validacion antes de commit/deploy

```bash
npx tsc --noEmit
npm run test
npm run build
```

Ultima validacion del cambio de identidad:

- TypeScript: paso.
- Tests: 19 archivos, 211 tests pasaron.
- Build: paso.

## Notas importantes

- `npm run db:seed` es destructivo y solo debe usarse para desarrollo/reset.
- `npm run db:seed:content` actualiza contenido sin borrar usuarios ni progreso.
- Si se cambia el dominio final, actualizar `lib/brand.ts` y verificar Resend/DNS.
- El email actual de sistema usa `noreply@paskalito.com`; ese dominio debe verificarse antes de produccion.
