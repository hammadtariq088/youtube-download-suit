import { motion } from "framer-motion";
import { Download, Loader2, Search } from "lucide-react";

interface HeroProps {
  url: string;
  urlError: string;
  isPending: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const headingWords = ["Download", "YouTube", "Videos", "&", "Audio"];

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.25 + i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export function Hero({ url, urlError, isPending, onUrlChange, onSubmit }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden px-5 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/[0.03] absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="bg-primary/[0.02] absolute top-20 -left-20 h-[300px] w-[300px] rounded-full blur-[100px]" />
        <div className="bg-primary/[0.02] absolute top-40 -right-20 h-[250px] w-[250px] rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        >
          <div className="border-border/80 bg-card/80 text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-sm backdrop-blur-sm">
            <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
            Free, fast, and secure — no sign-up required
          </div>
        </motion.div>

        <h1 className="text-foreground mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.08]">
          {headingWords.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className={`mr-[0.3em] inline-block ${word === "&" ? "text-primary" : ""}`}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
          className="text-muted-foreground mx-auto mb-12 max-w-lg text-base leading-relaxed sm:text-lg lg:text-xl"
        >
          Paste a YouTube link and download high-quality MP4 videos or MP3 audio in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
        >
          <form onSubmit={onSubmit} className="mx-auto max-w-xl">
            <div
              className={`bg-card flex items-center gap-2 rounded-2xl border p-1.5 shadow-lg ring-1 shadow-black/[0.03] ring-black/[0.03] transition-all duration-200 ${
                urlError
                  ? "border-destructive ring-destructive/20 shadow-destructive/5 ring-2"
                  : "border-border/80 focus-within:border-primary/40 focus-within:ring-primary/10 focus-within:shadow-primary/5 focus-within:ring-2"
              }`}
            >
              <div className="flex flex-1 items-center gap-2.5 pl-3.5">
                <Search className="text-muted-foreground/70 h-4.5 w-4.5 shrink-0" />
                <input
                  type="url"
                  placeholder="Paste YouTube URL here..."
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  className="text-foreground placeholder:text-muted-foreground/50 h-12 w-full bg-transparent text-sm outline-none sm:text-[15px]"
                  disabled={isPending}
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="bg-primary shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/30 inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-5.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{isPending ? "Getting..." : "Download"}</span>
              </button>
            </div>
            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive mt-2.5 text-left text-sm"
              >
                {urlError}
              </motion.p>
            )}
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="text-muted-foreground/60 mt-5 flex items-center justify-center gap-5 text-xs"
          >
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fast
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              No sign-up
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
