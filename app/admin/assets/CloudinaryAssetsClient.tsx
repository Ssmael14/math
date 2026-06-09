"use client";

import { useEffect, useMemo, useState } from "react";

type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  uploadUrl: string;
  tags?: string;
  context?: string;
};

type UploadedAsset = {
  publicId: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
};

const maxFileSizeMb = 10;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readError(value: unknown, fallback: string) {
  if (!isRecord(value)) return fallback;
  const detail = typeof value.detail === "string" ? value.detail : null;
  const error = typeof value.error === "string" ? value.error : null;
  return detail || error || fallback;
}

function parseUploadResult(value: unknown): UploadedAsset | null {
  if (!isRecord(value)) return null;
  const publicId = typeof value.public_id === "string" ? value.public_id : null;
  const secureUrl = typeof value.secure_url === "string" ? value.secure_url : null;
  const format = typeof value.format === "string" ? value.format : "unknown";
  const resourceType =
    typeof value.resource_type === "string" ? value.resource_type : "image";

  if (!publicId || !secureUrl) return null;

  return {
    publicId,
    secureUrl,
    format,
    resourceType,
    width: typeof value.width === "number" ? value.width : null,
    height: typeof value.height === "number" ? value.height : null,
    bytes: typeof value.bytes === "number" ? value.bytes : null,
  };
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "Tamano no disponible";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function tagsFromInput(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function CloudinaryAssetsClient({
  defaultFolder,
  folders,
  missingConfig,
}: {
  defaultFolder: string;
  folders: string[];
  missingConfig: string[];
}) {
  const [folder, setFolder] = useState(defaultFolder);
  const [tags, setTags] = useState("admin,paskalito");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedAsset | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isReady = missingConfig.length === 0;
  const fileError = useMemo(() => {
    if (!file) return null;
    if (!file.type.startsWith("image/")) return "Solo se permiten imagenes.";
    if (file.size > maxFileSizeBytes) {
      return `La imagen no puede superar ${maxFileSizeMb} MB.`;
    }
    return null;
  }, [file]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function upload() {
    if (!file || fileError || busy) return;

    setBusy(true);
    setMessage(null);
    setUploaded(null);
    setCopied(false);

    try {
      const signResponse = await fetch("/api/admin/cloudinary/sign-upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          folder,
          tags: tagsFromInput(tags),
          context: {
            source: "admin-assets",
            original_filename: file.name,
          },
        }),
      });
      const signedJson = await signResponse.json().catch(() => null);

      if (!signResponse.ok) {
        throw new Error(
          readError(signedJson, "No se pudo firmar la subida a Cloudinary."),
        );
      }

      const signed = signedJson as SignedUpload;
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", String(signed.timestamp));
      form.append("folder", signed.folder);
      form.append("signature", signed.signature);
      if (signed.tags) form.append("tags", signed.tags);
      if (signed.context) form.append("context", signed.context);

      const uploadResponse = await fetch(signed.uploadUrl, {
        method: "POST",
        body: form,
      });
      const uploadJson = await uploadResponse.json().catch(() => null);

      if (!uploadResponse.ok) {
        throw new Error(readError(uploadJson, "Cloudinary rechazo la imagen."));
      }

      const result = parseUploadResult(uploadJson);
      if (!result) {
        throw new Error("Cloudinary respondio sin URL segura.");
      }

      setUploaded(result);
      setMessage("Imagen subida correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo subir.");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    if (!uploaded) return;
    await navigator.clipboard.writeText(uploaded.secureUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_0_rgba(15,23,42,0.06)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-fredoka text-xl font-bold text-slate-950">
              Subir imagen
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Usa PNG, JPG, WEBP o SVG. Para el MVP la URL se copia manualmente;
              luego podremos guardarla en una tabla de assets.
            </p>
          </div>
          <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#2445d8]">
            Admin
          </span>
        </div>

        {!isReady && (
          <div className="mt-5 rounded-2xl border border-[#ffd3df] bg-[#fff0f4] px-4 py-3 text-sm font-bold text-[#c93658]">
            Falta configurar Cloudinary: {missingConfig.join(", ")}.
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Carpeta rapida
            </span>
            <select
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none focus:border-[#4867f5]"
            >
              {folders.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Carpeta editable
            </span>
            <input
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              placeholder="paskalito/uploads"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-[#4867f5]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Tags
            </span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="admin,paskalito,math"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-[#4867f5]"
            />
          </label>

          <label className="grid min-h-[220px] cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center hover:border-[#4867f5]">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={(event) => {
                setUploaded(null);
                setCopied(false);
                setMessage(null);
                setFile(event.target.files?.[0] ?? null);
              }}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="max-h-56 max-w-full rounded-2xl object-contain"
              />
            ) : (
              <div>
                <div className="font-fredoka text-2xl font-bold text-slate-950">
                  Elegir imagen
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-500">
                  Haz clic para seleccionar un archivo desde tu equipo.
                </div>
              </div>
            )}
          </label>

          {file && (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              <span className="font-bold text-slate-950">{file.name}</span> ·{" "}
              {formatBytes(file.size)}
            </div>
          )}

          {fileError && (
            <div className="rounded-2xl bg-[#fff0f4] px-4 py-3 text-sm font-bold text-[#c93658]">
              {fileError}
            </div>
          )}

          {message && (
            <div className="rounded-2xl bg-[#eef3ff] px-4 py-3 text-sm font-bold text-[#2445d8]">
              {message}
            </div>
          )}

          <button
            type="button"
            disabled={!isReady || !file || !!fileError || busy}
            onClick={upload}
            className="btn-chunky rounded-2xl bg-[#4867f5] px-6 py-4 text-base font-black text-white shadow-[0_5px_0_#2445d8] disabled:opacity-50"
          >
            {busy ? "Subiendo..." : "Subir a Cloudinary"}
          </button>
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_0_rgba(15,23,42,0.06)] md:p-6">
        <h2 className="font-fredoka text-xl font-bold text-slate-950">
          Resultado
        </h2>

        {!uploaded ? (
          <div className="mt-5 rounded-3xl bg-slate-50 px-5 py-10 text-center text-sm font-semibold leading-6 text-slate-500">
            Cuando subas una imagen, la URL segura aparecera aqui para copiarla.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <img
              src={uploaded.secureUrl}
              alt="Imagen subida"
              className="max-h-56 w-full rounded-2xl object-contain bg-slate-50"
            />

            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-xs font-bold text-slate-500">
              <div>
                <span className="text-slate-950">Public ID:</span>{" "}
                {uploaded.publicId}
              </div>
              <div>
                <span className="text-slate-950">Formato:</span>{" "}
                {uploaded.format}
              </div>
              <div>
                <span className="text-slate-950">Tamano:</span>{" "}
                {formatBytes(uploaded.bytes)}
              </div>
              {uploaded.width && uploaded.height && (
                <div>
                  <span className="text-slate-950">Dimensiones:</span>{" "}
                  {uploaded.width} x {uploaded.height}
                </div>
              )}
            </div>

            <textarea
              readOnly
              value={uploaded.secureUrl}
              className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700 outline-none"
            />

            <button
              type="button"
              onClick={copyUrl}
              className="btn-chunky w-full rounded-2xl bg-[#34c759] px-5 py-3 text-sm font-black text-white shadow-[0_4px_0_#1f9e46]"
            >
              {copied ? "URL copiada" : "Copiar URL"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
