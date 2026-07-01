import { motion } from "framer-motion";
import { Download, Loader2, Search } from "lucide-react";

interface HeroProps {
  url: string;
  urlError: string;
  isPending: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function Hero({ url, urlError, isPending, onUrlChange, onSubmit }: HeroProps) {
  return (
    <section id="hero" className="relative overflow-hidden px-4 pb-16 pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-success" />
            Free &amp; Secure — No sign-up required
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Download YouTube
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Videos &amp; Audio
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Paste any YouTube link and download high-quality MP4 videos or MP3 audio in seconds. Fast, free, and no account needed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <form onSubmit={onSubmit} className="mx-auto mb-4 max-w-xl">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="Paste YouTube URL here..."
                  value={url}
                  onChange={(e) => {
                    onUrlChange(e.target.value);
                  }}
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  disabled={isPending}
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-[#1D4ED8] disabled:opacity-50 active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{isPending ? "Fetching..." : "Get Info"}</span>
              </button>
            </div>
            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-left text-sm text-destructive"
              >
                {urlError}
              </motion.p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
