import { notFound } from "next/navigation";
import { requireUser, isAdminEmail } from "@/lib/auth/server";
import { cloudinaryMissingConfig, normalizeCloudinaryFolder } from "@/lib/cloudinary";
import { CloudinaryAssetsClient } from "./CloudinaryAssetsClient";

export const dynamic = "force-dynamic";

const defaultFolders = [
  "paskalito/uploads",
  "paskalito/subjects",
  "paskalito/paths",
  "paskalito/lessons",
  "paskalito/exercises",
  "paskalito/mascot",
  "paskalito/marketing",
];

export default async function AdminAssetsPage() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <header className="mb-7">
        <div className="text-xs font-black uppercase tracking-widest text-[#4867f5]">
          Admin
        </div>
        <h1 className="mt-1 font-fredoka text-3xl font-bold text-slate-950">
          Assets de Cloudinary
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Sube imagenes dinamicas de Paskalito sin guardar archivos pesados en el
          repo. Usa esto para iconos de materias, rutas, ejercicios, mascota y
          material de marketing.
        </p>
      </header>

      <CloudinaryAssetsClient
        defaultFolder={normalizeCloudinaryFolder()}
        folders={defaultFolders}
        missingConfig={cloudinaryMissingConfig()}
      />
    </main>
  );
}
