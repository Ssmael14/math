// lib/tts/blob.ts
// Subida a Vercel Blob vía su API REST (sin SDK, sin dependencia nueva).
// Solo se usa desde el script batch `gen:audio`.

/** Sube `data` a Vercel Blob bajo `pathname` y devuelve la URL pública. */
export async function uploadToBlob(
  pathname: string,
  data: Buffer,
  contentType = "audio/mpeg",
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("Falta BLOB_READ_WRITE_TOKEN");

  const res = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-content-type": contentType,
      // Audio inmutable: la clave es el hash del texto, así que cachéalo fuerte.
      "x-add-random-suffix": "0",
      "x-cache-control-max-age": "31536000",
    },
    body: new Uint8Array(data),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Vercel Blob ${res.status}: ${detail.slice(0, 200)}`);
  }
  const json = (await res.json()) as { url: string };
  return json.url;
}
