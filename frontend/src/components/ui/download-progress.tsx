import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Download, RotateCcw } from "lucide-react";

interface DownloadProgressProps {
  isPending: boolean;
  isFailed: boolean;
  isCompleted: boolean;
  progress: number;
  errorMessage: string | null;
  isDownloadUrlPending: boolean;
  onDownloadFile: () => void;
  onReset: () => void;
}

export function DownloadProgress({
  isPending,
  isFailed,
  isCompleted,
  progress,
  errorMessage,
  isDownloadUrlPending,
  onDownloadFile,
  onReset,
}: DownloadProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-xl border border-border bg-card p-8 text-center shadow-sm"
    >
      {isFailed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">Download Failed</h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            {errorMessage || "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={onReset}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        </motion.div>
      ) : isCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">Ready to Download</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Your file is ready for download.
          </p>
          <button
            onClick={onDownloadFile}
            disabled={isDownloadUrlPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-[#1D4ED8] disabled:opacity-50 active:scale-[0.98]"
          >
            {isDownloadUrlPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloadUrlPending ? "Generating..." : "Download File"}
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">Processing...</h3>
          <p className="text-sm text-muted-foreground">
            {isPending ? "Starting download..." : `${progress}% complete`}
          </p>
          <div className="mx-auto mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Please wait while we process your file
          </p>
        </div>
      )}
    </motion.div>
  );
}
