export type MetadataProvider = "yt-dlp" | "apify";

export interface VideoMetadataResult {
  data: VideoInfo;
  provider: MetadataProvider;
}

export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum JobQueue {
  VIDEO_INFO = "video-info",
  DOWNLOAD = "download",
  CLEANUP = "cleanup",
}

export enum DownloadFormat {
  MP4 = "mp4",
  MP3 = "mp3",
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
}

export interface DownloadJob {
  id: string;
  downloadId: string;
  url: string;
  format: DownloadFormat;
  status: JobStatus;
  progress: number;
  errorMessage: string | null;
  fileSize: number | null;
  r2Key: string | null;
  fileName: string | null;
  fileExtension: string | null;
  mimeType: string | null;
  provider: MetadataProvider | null;
  youtubeVideoId: string | null;
  r2Url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadResponse {
  success: boolean;
  fileName: string;
  format: string;
  downloadUrl: string;
  storage: string;
  downloadId: string;
  size: number | null;
  provider: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VideoInfoRequest {
  url: string;
}

export interface ConvertRequest {
  url: string;
  format: DownloadFormat;
}
