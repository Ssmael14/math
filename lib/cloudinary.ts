import { v2 as cloudinary } from "cloudinary";

type Env = Record<string, string | undefined>;

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export type CloudinaryUploadSignatureInput = {
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
};

export type CloudinaryUploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  uploadUrl: string;
  tags?: string;
  context?: string;
};

const DEFAULT_UPLOAD_FOLDER = "paskalito/uploads";

export function resolveCloudinaryConfig(env: Env = process.env): CloudinaryConfig | null {
  const fromUrl = env.CLOUDINARY_URL?.trim();
  if (fromUrl) {
    try {
      const parsed = new URL(fromUrl);
      if (
        parsed.protocol === "cloudinary:" &&
        parsed.hostname &&
        parsed.username &&
        parsed.password
      ) {
        return {
          cloudName: parsed.hostname,
          apiKey: decodeURIComponent(parsed.username),
          apiSecret: decodeURIComponent(parsed.password),
        };
      }
    } catch {
      return null;
    }
  }

  const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function cloudinaryMissingConfig(env: Env = process.env): string[] {
  if (resolveCloudinaryConfig(env)) return [];
  if (env.CLOUDINARY_URL?.trim()) return ["valid CLOUDINARY_URL"];

  return [
    ["CLOUDINARY_CLOUD_NAME", env.CLOUDINARY_CLOUD_NAME],
    ["CLOUDINARY_API_KEY", env.CLOUDINARY_API_KEY],
    ["CLOUDINARY_API_SECRET", env.CLOUDINARY_API_SECRET],
  ]
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key as string);
}

export function getCloudinaryClient() {
  const config = resolveCloudinaryConfig();
  if (!config) {
    throw new Error(`Falta configurar Cloudinary: ${cloudinaryMissingConfig().join(", ")}`);
  }

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return cloudinary;
}

export function normalizeCloudinaryFolder(folder?: string, env: Env = process.env): string {
  const raw = (folder || env.CLOUDINARY_UPLOAD_FOLDER || DEFAULT_UPLOAD_FOLDER)
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "");

  if (!raw) throw new Error("La carpeta de Cloudinary no puede estar vacía.");
  if (raw.includes("..")) throw new Error("La carpeta de Cloudinary no puede contener '..'.");
  if (!/^[a-zA-Z0-9/_-]+$/.test(raw)) {
    throw new Error("La carpeta de Cloudinary solo puede usar letras, números, '/', '_' y '-'.");
  }
  if (raw !== "paskalito" && !raw.startsWith("paskalito/")) {
    throw new Error("Las subidas deben vivir dentro de la carpeta 'paskalito/'.");
  }

  return raw;
}

export function normalizeCloudinaryTags(tags?: string[]): string | undefined {
  const clean = [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))]
    .filter((tag) => /^[a-zA-Z0-9_-]+$/.test(tag))
    .slice(0, 10);

  return clean.length ? clean.join(",") : undefined;
}

export function normalizeCloudinaryContext(context?: Record<string, string>): string | undefined {
  const entries = Object.entries(context ?? {})
    .map(([key, value]) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => key && value)
    .filter(([key]) => /^[a-zA-Z0-9_-]+$/.test(key))
    .slice(0, 10);

  return entries.length
    ? entries
        .map(([key, value]) => `${key}=${value.replace(/[|=]/g, " ").slice(0, 200)}`)
        .join("|")
    : undefined;
}

export function createCloudinaryUploadSignature(
  input: CloudinaryUploadSignatureInput = {},
  env: Env = process.env,
): CloudinaryUploadSignature {
  const config = resolveCloudinaryConfig(env);
  if (!config) {
    throw new Error(`Falta configurar Cloudinary: ${cloudinaryMissingConfig(env).join(", ")}`);
  }

  const folder = normalizeCloudinaryFolder(input.folder, env);
  const timestamp = Math.round(Date.now() / 1000);
  const tags = normalizeCloudinaryTags(input.tags);
  const context = normalizeCloudinaryContext(input.context);

  const paramsToSign: Record<string, number | string> = { folder, timestamp };
  if (tags) paramsToSign.tags = tags;
  if (context) paramsToSign.context = context;

  const signature = cloudinary.utils.api_sign_request(paramsToSign, config.apiSecret);

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    folder,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`,
    ...(tags ? { tags } : {}),
    ...(context ? { context } : {}),
  };
}
