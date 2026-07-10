const INVALID_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const MAX_LENGTH = 200;

export function sanitizeFilename(title: string): string {
  let sanitized = title
    .replace(INVALID_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) {
    sanitized = "untitled";
  }

  if (WINDOWS_RESERVED.test(sanitized.replace(/\.[^.]+$/, ""))) {
    sanitized = `_${sanitized}`;
  }

  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.slice(0, MAX_LENGTH).trim();
  }

  if (sanitized.endsWith(".")) {
    sanitized = sanitized.slice(0, -1).trim() || "untitled";
  }

  return sanitized;
}

export function buildFileName(
  videoId: string,
  title: string,
  format: string,
): { r2Key: string; fileName: string } {
  const ext = format === "mp3" ? "mp3" : "mp4";
  const sanitized = sanitizeFilename(title);
  const fileName = `${sanitized}.${ext}`;
  const r2Key = `downloads/${ext}/${videoId}-${sanitized}.${ext}`;

  return { r2Key, fileName };
}
