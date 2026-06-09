import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { getCloudinaryClient } from "../lib/cloudinary";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const localAssetUrls = {
  logo: "/brand/paskalito-logo.png",
  mark: "/brand/paskalito-mark.png",
} as const;

const cloudinaryAssets = [
  {
    key: "mascotHappy",
    file: "public/brand/paskalito-mascot-happy.png",
    folder: "paskalito/mascot",
    publicId: "paskalito-mascot-happy",
    tags: ["mascot"],
  },
  {
    key: "mascotCelebrate",
    file: "public/brand/paskalito-mascot-celebrate.png",
    folder: "paskalito/mascot",
    publicId: "paskalito-mascot-celebrate",
    tags: ["mascot"],
  },
  {
    key: "mascotSad",
    file: "public/brand/paskalito-mascot-sad.png",
    folder: "paskalito/mascot",
    publicId: "paskalito-mascot-sad",
    tags: ["mascot"],
  },
  {
    key: "mascotSleepy",
    file: "public/brand/paskalito-mascot-sleepy.png",
    folder: "paskalito/mascot",
    publicId: "paskalito-mascot-sleepy",
    tags: ["mascot"],
  },
  {
    key: "mascotTeach",
    file: "public/brand/paskalito-mascot-teach.png",
    folder: "paskalito/mascot",
    publicId: "paskalito-mascot-teach",
    tags: ["mascot"],
  },
  {
    key: "subjectMath",
    file: "public/brand/subject-math-icon.png",
    folder: "paskalito/subjects",
    publicId: "subject-math-icon",
    tags: ["subjects", "math"],
  },
  {
    key: "subjectReading",
    file: "public/brand/subject-reading-icon.png",
    folder: "paskalito/subjects",
    publicId: "subject-reading-icon",
    tags: ["subjects", "reading"],
  },
  {
    key: "pathMathInitial",
    file: "public/brand/path-math-initial-icon.png",
    folder: "paskalito/paths",
    publicId: "path-math-initial-icon",
    tags: ["paths", "math", "initial"],
  },
  {
    key: "pathNumberTracing",
    file: "public/brand/path-number-tracing-icon.png",
    folder: "paskalito/paths",
    publicId: "path-number-tracing-icon",
    tags: ["paths", "math", "initial", "tracing"],
  },
  {
    key: "pathReadingInitial",
    file: "public/brand/path-reading-initial-icon.png",
    folder: "paskalito/paths",
    publicId: "path-reading-initial-icon",
    tags: ["paths", "reading", "initial"],
  },
] as const;

type LocalAssetKey = keyof typeof localAssetUrls;
type CloudinaryAssetKey = (typeof cloudinaryAssets)[number]["key"];
type AssetKey = LocalAssetKey | CloudinaryAssetKey;

function generatedTs(urls: Record<AssetKey, string>) {
  return `export const brandAssets = ${JSON.stringify(urls, null, 2)} as const;

export type BrandAssets = typeof brandAssets;
`;
}

async function main() {
  const cloudinary = getCloudinaryClient();
  const cloudinaryUrls = {} as Record<CloudinaryAssetKey, string>;

  for (const asset of cloudinaryAssets) {
    const filePath = path.join(projectDir, asset.file);
    console.log(`Uploading ${asset.file} -> ${asset.folder}/${asset.publicId}`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: asset.folder,
      public_id: asset.publicId,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
      tags: ["paskalito", ...asset.tags],
      context: `source=brand-assets|asset_key=${asset.key}`,
    });

    cloudinaryUrls[asset.key] = result.secure_url;
  }

  const urls = {
    ...localAssetUrls,
    ...cloudinaryUrls,
  } satisfies Record<AssetKey, string>;

  await writeFile(
    path.join(projectDir, "lib/brand-assets.generated.ts"),
    generatedTs(urls),
    "utf8",
  );
  await writeFile(
    path.join(projectDir, "public/brand/cloudinary-assets.json"),
    `${JSON.stringify(cloudinaryUrls, null, 2)}\n`,
    "utf8",
  );

  console.log("Brand assets updated in lib/brand-assets.generated.ts");
  console.log("Cloudinary URL manifest written to public/brand/cloudinary-assets.json");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
