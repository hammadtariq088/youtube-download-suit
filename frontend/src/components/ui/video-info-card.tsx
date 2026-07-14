import { motion } from "framer-motion";
import { Download, User, Eye, Clock } from "lucide-react";
import { formatDuration, formatNumber } from "@/lib/utils";
import type { VideoInfo } from "@yds/shared/types";

interface VideoInfoCardProps {
  videoInfo: VideoInfo;
  isDownloadPending: boolean;
  onDownload: (format: "mp4" | "mp3") => void;
  error: Error | null;
}

export function VideoInfoCard({
  videoInfo,
  isDownloadPending,
  onDownload,
  error,
}: VideoInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden md:w-80">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {formatDuration(videoInfo.duration)}
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3 p-5 sm:p-6">
            <h2 className="line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-lg">
              {videoInfo.title}
            </h2>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {videoInfo.description}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {videoInfo.uploader}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(videoInfo.views)} views
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(videoInfo.duration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onDownload("mp4")}
          disabled={isDownloadPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Download MP4
        </button>
        <button
          onClick={() => onDownload("mp3")}
          disabled={isDownloadPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Download MP3
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-destructive"
        >
          {error.message}
        </motion.p>
      )}
    </motion.div>
  );
}
