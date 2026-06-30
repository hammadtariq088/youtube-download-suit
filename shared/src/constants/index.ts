export const QUEUES = {
  VIDEO_INFO: "video-info",
  DOWNLOAD: "download",
  AUDIO: "audio",
  VIDEO: "video",
  CLEANUP: "cleanup",
  RETRY: "retry",
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
  RETRYING: "retrying",
  CANCELLED: "cancelled",
} as const;

export const FORMAT_EXTENSIONS = {
  MP4: "mp4",
  MP3: "mp3",
  M4A: "m4a",
  WEBM: "webm",
  MKV: "mkv",
} as const;

export const QUALITY_OPTIONS = [
  { label: "Best Available", value: "best" },
  { label: "1080p", value: "1080p" },
  { label: "720p", value: "720p" },
  { label: "480p", value: "480p" },
  { label: "360p", value: "360p" },
] as const;

export const POLL_INTERVAL_MS = 2000;

export const SIGNED_URL_EXPIRY_SECONDS = 600;

export const MAX_RETRY_ATTEMPTS = 5;

export const RETRY_BACKOFF_MINUTES = [1, 2, 4, 8, 16];

export const YTDLP_UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const TEMP_DIR = "/tmp/yds-downloads";

export const API_PREFIX = "/api";

export const RATE_LIMITS = {
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
  AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
  DOWNLOAD: { windowMs: 60 * 60 * 1000, max: 50 },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const SUPPORTED_URL_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
  /^https?:\/\/youtu\.be\/[\w-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[\w-]+/,
  /^https?:\/\/(www\.)?youtube\.com\/live\/[\w-]{11}/,
];

export const MIME_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

export const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace"] as const;

export const ERROR_CODES = {
  INVALID_URL: "INVALID_URL",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_QUALITY: "INVALID_QUALITY",
  UNSUPPORTED_SERVICE: "UNSUPPORTED_SERVICE",
  VIDEO_NOT_FOUND: "VIDEO_NOT_FOUND",
  DOWNLOAD_FAILED: "DOWNLOAD_FAILED",
  CONVERSION_FAILED: "CONVERSION_FAILED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
  QUEUE_ERROR: "QUEUE_ERROR",
  WORKER_OFFLINE: "WORKER_OFFLINE",
  RATE_LIMITED: "RATE_LIMITED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
