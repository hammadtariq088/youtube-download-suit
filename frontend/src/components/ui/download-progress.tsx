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
      className="border-border bg-card rounded-xl border p-8 text-center shadow-sm"
    >
      {isFailed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="bg-destructive/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <XCircle className="text-destructive h-7 w-7" />
          </div>
          <h3 className="text-foreground mb-1 text-lg font-semibold">Download Failed</h3>
          <p className="text-muted-foreground mb-6 max-w-xs text-sm">
            {errorMessage || "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={onReset}
            className="border-border bg-card text-foreground hover:bg-secondary inline-flex h-10 items-center gap-2 rounded-lg border px-5 text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
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
          <div className="bg-success/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle2 className="text-success h-7 w-7" />
          </div>
          <h3 className="text-foreground mb-1 text-lg font-semibold">Ready to Download</h3>
          <p className="text-muted-foreground mb-6 text-sm">Your file is ready for download.</p>
          <button
            onClick={onDownloadFile}
            disabled={isDownloadUrlPending}
            className="bg-primary text-primary-foreground inline-flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-medium shadow-sm transition-all hover:bg-[#1D4ED8] active:scale-[0.98] disabled:opacity-50"
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
        <div className="mt-4 flex flex-col items-center">
          <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Loader2 className="text-primary h-7 w-7 animate-spin" />
          </div>
          <h3 className="text-foreground mb-1 text-lg font-semibold">Processing...</h3>
          <p className="text-muted-foreground text-sm">
            {isPending ? "Starting download..." : `${progress}% complete`}
          </p>
          <div className="bg-muted mx-auto mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full">
            <motion.div
              className="from-primary to-accent h-full rounded-full bg-gradient-to-r"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Please wait while we process your file
          </p>
        </div>
      )}
    </motion.div>
  );
}
