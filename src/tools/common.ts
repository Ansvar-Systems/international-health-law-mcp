export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export function clampLimit(limit: number | undefined, fallback: number = DEFAULT_LIMIT): number {
  const value = Number.isFinite(limit) ? Number(limit) : fallback;
  return Math.min(Math.max(Math.trunc(value), 1), MAX_LIMIT);
}

export function escapeFTS5Query(query: string): string {
  const specialChars = /[()^*:]/g;
  return query.replace(specialChars, (char) => `"${char}"`);
}

export function parseJsonField<T>(value: string | null | undefined): T | null {
  if (!value || value.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function normalizeOptionalText(value: string | undefined | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeStringArray(values: string[] | undefined): string[] {
  if (!values) {
    return [];
  }

  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function daysSince(dateValue: string | null | undefined, now: Date = new Date()): number | null {
  if (!dateValue) {
    return null;
  }

  const timestamp = Date.parse(dateValue);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  const deltaMs = now.getTime() - timestamp;
  return Math.max(0, Math.floor(deltaMs / 86_400_000));
}

export function toIsoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
