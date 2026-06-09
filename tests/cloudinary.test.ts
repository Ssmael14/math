import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cloudinaryMissingConfig,
  createCloudinaryUploadSignature,
  normalizeCloudinaryContext,
  normalizeCloudinaryFolder,
  normalizeCloudinaryTags,
  resolveCloudinaryConfig,
} from "@/lib/cloudinary";

const env = {
  CLOUDINARY_CLOUD_NAME: "demo-cloud",
  CLOUDINARY_API_KEY: "key123",
  CLOUDINARY_API_SECRET: "secret123",
  CLOUDINARY_UPLOAD_FOLDER: "paskalito/uploads",
};

describe("Cloudinary config", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-09T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resuelve CLOUDINARY_URL", () => {
    expect(
      resolveCloudinaryConfig({
        CLOUDINARY_URL: "cloudinary://api%20key:api%2Fsecret@paskalito",
      }),
    ).toEqual({
      cloudName: "paskalito",
      apiKey: "api key",
      apiSecret: "api/secret",
    });
  });

  it("resuelve variables separadas", () => {
    expect(resolveCloudinaryConfig(env)).toEqual({
      cloudName: "demo-cloud",
      apiKey: "key123",
      apiSecret: "secret123",
    });
  });

  it("reporta configuracion faltante", () => {
    expect(cloudinaryMissingConfig({ CLOUDINARY_CLOUD_NAME: "demo-cloud" })).toEqual([
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]);
  });

  it("normaliza carpetas dentro de paskalito", () => {
    expect(normalizeCloudinaryFolder(" /paskalito/admin/icons/ ", env)).toBe(
      "paskalito/admin/icons",
    );
    expect(normalizeCloudinaryFolder(undefined, env)).toBe("paskalito/uploads");
  });

  it("rechaza carpetas fuera de paskalito", () => {
    expect(() => normalizeCloudinaryFolder("other/uploads", env)).toThrow(
      "paskalito",
    );
    expect(() => normalizeCloudinaryFolder("paskalito/../other", env)).toThrow(
      "..",
    );
  });

  it("normaliza tags y context", () => {
    expect(
      normalizeCloudinaryTags(["math", " math ", "bad tag", "initial"]),
    ).toBe("math,initial");
    expect(
      normalizeCloudinaryContext({
        source: "admin",
        bad: "a=b|c",
        "bad key": "ignored",
      }),
    ).toBe("source=admin|bad=a b c");
  });

  it("crea firma de upload sin exponer el secret", () => {
    const signature = createCloudinaryUploadSignature(
      {
        folder: "paskalito/admin",
        tags: ["math", "initial"],
        context: { source: "test" },
      },
      env,
    );

    expect(signature).toMatchObject({
      cloudName: "demo-cloud",
      apiKey: "key123",
      timestamp: 1781006400,
      folder: "paskalito/admin",
      uploadUrl: "https://api.cloudinary.com/v1_1/demo-cloud/auto/upload",
      tags: "math,initial",
      context: "source=test",
    });
    expect(signature.signature).toEqual(expect.any(String));
    expect(JSON.stringify(signature)).not.toContain("secret123");
  });
});
