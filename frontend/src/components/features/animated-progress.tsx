import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface AnimatedProgressProps {
  progress: number;
  status: string;
  errorMessage?: string | null;
}

export function AnimatedProgress({ progress, status, errorMessage }: AnimatedProgressProps) {
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isProcessing = status === "processing" || status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md space-y-4"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {isCompleted
            ? "Download complete!"
            : isFailed
              ? "Download failed"
              : "Processing your download..."}
        </span>
        <span className="font-medium">{progress}%</span>
      </div>

      <Progress value={progress} className="h-3" />

      <div className="flex items-center justify-center gap-2 text-sm">
        {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {isFailed && <XCircle className="h-4 w-4 text-destructive" />}
        <span className="text-muted-foreground">
          {isCompleted && "Your file is ready for download"}
          {isFailed && (errorMessage || "An error occurred during processing")}
          {isProcessing && "Please wait while we process your file"}
        </span>
      </div>
    </motion.div>
  );
}
