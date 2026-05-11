const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value) {
  if (typeof value !== "string") return false;
  return EMAIL_RE.test(value);
}

export function isUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function isNonEmpty(value) {
  if (typeof value !== "string") return false;
  return value.trim().length > 0;
}
