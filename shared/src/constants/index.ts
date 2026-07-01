export const QUEUES = {
  VIDEO_INFO: "video-info",
  DOWNLOAD: "download",
  CLEANUP: "cleanup",
} as const;

export const DOWNLOAD_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const JOB_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const FORMAT_EXTENSIONS: Record<string, string> = {
  mp4: "mp4",
  mp3: "mp3",
};

export const SUPPORTED_FORMATS = ["mp4", "mp3"] as const;

export const MAX_DURATION_SECONDS = 14400;
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024;

export const POLL_INTERVAL_MS = 2000;

export const SIGNED_URL_EXPIRY_SECONDS = 600;

export const YTDLP_UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const TEMP_DIR = "/tmp/yds-downloads";

export const API_PREFIX = "/api";

export const RATE_LIMITS = {
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
  DOWNLOAD: { windowMs: 60 * 60 * 1000, max: 50 },
} as const;

export const SUPPORTED_URL_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
  /^https?:\/\/youtu\.be\/[\w-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/live\/[\w-]{11}/,
];

export const MIME_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  mp3: "audio/mpeg",
};

export const ERROR_CODES = {
  INVALID_URL: "INVALID_URL",
  INVALID_FORMAT: "INVALID_FORMAT",
  VIDEO_NOT_FOUND: "VIDEO_NOT_FOUND",
  VIDEO_TOO_LONG: "VIDEO_TOO_LONG",
  VIDEO_TOO_LARGE: "VIDEO_TOO_LARGE",
  DOWNLOAD_FAILED: "DOWNLOAD_FAILED",
  CONVERSION_FAILED: "CONVERSION_FAILED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
  QUEUE_ERROR: "QUEUE_ERROR",
  WORKER_OFFLINE: "WORKER_OFFLINE",
  RATE_LIMITED: "RATE_LIMITED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
