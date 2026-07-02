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
    <section id="hero" className="relative overflow-hidden px-4 pt-28 pb-16 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/5 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-accent/5 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/[0.03] absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="border-border bg-secondary text-muted-foreground mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="bg-success flex h-2 w-2 rounded-full" />
            Free &amp; Secure — No sign-up required
          </div>

          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Download YouTube
            <br />
            <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
              Videos &amp; Audio
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-base leading-relaxed sm:text-lg">
            Paste YouTube link and download high-quality MP4 videos or MP3 audio in seconds. Fast,
            free, and no sign up needed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <form onSubmit={onSubmit} className="mx-auto mb-4 max-w-xl">
            <div className="border-border bg-card focus-within:border-primary focus-within:ring-primary/20 flex items-center gap-2 rounded-xl border p-1.5 shadow-sm transition-all focus-within:ring-2">
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="text-muted-foreground h-5 w-5 shrink-0" />
                <input
                  type="url"
                  placeholder="Paste YouTube URL here..."
                  value={url}
                  onChange={(e) => {
                    onUrlChange(e.target.value);
                  }}
                  className="placeholder:text-muted-foreground h-11 w-full bg-transparent text-sm outline-none"
                  disabled={isPending}
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium shadow-sm transition-all hover:bg-[#1D4ED8] active:scale-95 disabled:opacity-50"
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
                className="text-destructive mt-2 text-left text-sm"
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
