import { motion } from "framer-motion";

export function VideoSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="aspect-video w-full animate-pulse bg-muted md:w-72" />
          <div className="flex-1 space-y-3 p-5 md:p-6">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="flex gap-4 pt-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
