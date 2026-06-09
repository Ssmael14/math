import { NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth/server";
import {
  cloudinaryMissingConfig,
  createCloudinaryUploadSignature,
} from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
}

function readContext(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const limited = rateLimit(`admin:cloudinary-sign:${user.id}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const missing = cloudinaryMissingConfig();
  if (missing.length) {
    return NextResponse.json(
      { error: "missing_config", detail: missing.join(", ") },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const folder = typeof body?.folder === "string" ? body.folder : undefined;
  const tags = readStringArray(body?.tags);
  const context = readContext(body?.context);

  try {
    return NextResponse.json(
      createCloudinaryUploadSignature({ folder, tags, context }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid_upload_params",
        detail: error instanceof Error ? error.message : "Parametros invalidos",
      },
      { status: 400 },
    );
  }
}
