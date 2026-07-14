import { motion } from "framer-motion";

export function VideoSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="aspect-video w-full animate-pulse bg-muted md:w-80" />
          <div className="flex-1 space-y-3.5 p-5 sm:p-6">
            <div className="h-5 w-3/4 rounded-lg bg-muted" />
            <div className="h-4 w-full rounded-lg bg-muted" />
            <div className="h-4 w-2/3 rounded-lg bg-muted" />
            <div className="flex gap-4 pt-1">
              <div className="h-3.5 w-20 rounded bg-muted" />
              <div className="h-3.5 w-24 rounded bg-muted" />
              <div className="h-3.5 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
