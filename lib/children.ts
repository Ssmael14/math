export const CHILD_AVATARS = ["🦁", "🐯", "🦊", "🐼", "🐻", "🐸", "🦄", "🐙", "🦖"] as const;

export const MAX_CHILD_PROFILES = 8;

export function normalizeChildName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 32) return null;
  return name;
}

export function birthDateFromAge(value: unknown) {
  if (!Number.isInteger(value)) return null;
  const age = value as number;
  if (age < 1 || age > 12) return null;
  return new Date(Date.UTC(new Date().getUTCFullYear() - age, 0, 1));
}

export function normalizeChildAvatar(value: unknown) {
  if (typeof value !== "string") return CHILD_AVATARS[0];
  return CHILD_AVATARS.includes(value as (typeof CHILD_AVATARS)[number])
    ? value
    : CHILD_AVATARS[0];
}
