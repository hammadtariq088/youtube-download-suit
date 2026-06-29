export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  RETRYING = "retrying",
  CANCELLED = "cancelled",
}

export enum JobQueue {
  VIDEO_INFO = "video-info",
  DOWNLOAD = "download",
  AUDIO = "audio",
  VIDEO = "video",
  CLEANUP = "cleanup",
  RETRY = "retry",
}

export enum DownloadFormat {
  MP4 = "mp4",
  MP3 = "mp3",
  M4A = "m4a",
  WEBM = "webm",
  MKV = "mkv",
}

export enum DownloadQuality {
  BEST = "best",
  _1080P = "1080p",
  _720P = "720p",
  _480P = "480p",
  _360P = "360p",
}

export enum UserRole {
  ADMIN = "admin",
  VIEWER = "viewer",
}

export enum LogLevel {
  FATAL = "fatal",
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  uploaderUrl: string;
  views: number;
  uploadDate: string;
  formats: VideoFormat[];
  qualities: QualityOption[];
}

export interface VideoFormat {
  formatId: string;
  extension: string;
  resolution: string | null;
  filesize: number | null;
  filesizeApprox: number | null;
  bitrate: number | null;
  fps: number | null;
  codec: string | null;
  hasAudio: boolean;
  hasVideo: boolean;
  isAudioOnly: boolean;
}

export interface QualityOption {
  label: string;
  value: string;
  formats: string[];
}

export interface DownloadJob {
  id: string;
  downloadId: string;
  url: string;
  format: DownloadFormat;
  quality: DownloadQuality;
  status: JobStatus;
  progress: number;
  errorMessage: string | null;
  fileSize: number | null;
  r2Key: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsData {
  date: string;
  totalDownloads: number;
  successfulDownloads: number;
  failedDownloads: number;
  avgProcessingTimeMs: number;
  topFormats: Record<string, number>;
  topQualities: Record<string, number>;
}

export interface WorkerStatus {
  id: string;
  isRunning: boolean;
  uptime: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  ytdlpVersion: string;
  memoryUsage: number;
  cpuUsage: number;
}

export interface QueueStatus {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export interface CookieProfile {
  id: string;
  name: string;
  profile: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface VideoInfoRequest {
  url: string;
}

export interface ConvertRequest {
  url: string;
  format: DownloadFormat;
  quality: DownloadQuality;
}
