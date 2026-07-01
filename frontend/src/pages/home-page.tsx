import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { isValidYoutubeUrl, formatDuration, formatNumber } from "@/lib/utils";
import { POLL_INTERVAL_MS } from "@yds/shared/constants";
import type { VideoInfo } from "@yds/shared/types";
import {
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  User,
  Zap,
  Shield,
  Globe,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const features = [
  { icon: Zap, title: "Fast", description: "Lightning-fast downloads powered by parallel processing" },
  { icon: Shield, title: "Secure", description: "All downloads are encrypted and processed securely" },
  { icon: Globe, title: "Free", description: "No hidden fees, no sign-ups, completely free to use" },
  { icon: Sparkles, title: "High Quality", description: "Download in original quality up to 4K" },
];

const steps = [
  { number: "1", title: "Paste the URL", description: "Copy the URL of any YouTube video and paste it into the input above." },
  { number: "2", title: "Choose Format", description: "Select MP4 for video or MP3 for audio extraction." },
  { number: "3", title: "Download", description: "Your file is processed and ready in seconds. Download with one click." },
];

const faqs = [
  { q: "Is this service free?", a: "Yes, the service is completely free to use with no limits on downloads." },
  { q: "What formats are supported?", a: "We support MP4 for video downloads and MP3 for audio extraction." },
  { q: "Is there a limit on video length?", a: "There is no hard limit, but very long videos may take longer to process." },
  { q: "Do you store downloaded videos?", a: "Files are temporarily stored for a limited time and automatically deleted." },
  { q: "Can I download age-restricted videos?", a: "We comply with YouTube's terms of service and cannot bypass age restrictions." },
];

function useDownloadStatus(id: string | null) {
  return useQuery({
    queryKey: ["download-status", id],
    queryFn: () => api.download.status(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === "completed" || data.status === "failed") {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
  });
}

export function HomePage() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"mp4" | "mp3" | null>(null);

  const videoInfoMutation = useMutation<VideoInfo, Error, string>({
    mutationFn: (url) => api.video.info(url),
  });

  const downloadMutation = useMutation({
    mutationFn: ({ url, format }: { url: string; format: string }) =>
      api.video.convert(url, format),
    onSuccess: (data) => {
      setDownloadId(data.id);
    },
  });

  const downloadUrlMutation = useMutation({
    mutationFn: (id: string) => api.download.url(id),
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
  });

  const downloadStatus = useDownloadStatus(downloadId);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setUrlError("");
    setDownloadId(null);
    setSelectedFormat(null);
    downloadMutation.reset();
    downloadUrlMutation.reset();

    if (!url.trim()) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYoutubeUrl(url.trim())) {
      setUrlError("Please enter a valid YouTube URL");
      return;
    }

    videoInfoMutation.mutate(url.trim());
  }, [url, videoInfoMutation, downloadMutation, downloadUrlMutation]);

  const handleDownload = useCallback((format: "mp4" | "mp3") => {
    setSelectedFormat(format);
    downloadMutation.mutate({ url: url.trim(), format });
  }, [url, downloadMutation]);

  const handleReset = useCallback(() => {
    videoInfoMutation.reset();
    downloadMutation.reset();
    downloadUrlMutation.reset();
    setDownloadId(null);
    setSelectedFormat(null);
  }, [videoInfoMutation, downloadMutation, downloadUrlMutation]);

  const videoInfo = videoInfoMutation.data;
  const downloadData = downloadStatus.data;
  const isCompleted = downloadData?.status === "completed";
  const isFailed = downloadData?.status === "failed" || downloadMutation.isError;

  return (
    <main>
      <section className="relative overflow-hidden px-4 pb-8 pt-16 sm:pt-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.06),transparent)]" />
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              YouTube
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Downloader</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Download your favorite YouTube videos as MP4 or extract audio as MP3. Fast, free, and no sign-up required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="mx-auto mb-6 max-w-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="Paste YouTube URL here..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) setUrlError("");
                    }}
                    className="h-12 w-full rounded-lg border border-input bg-background px-4 text-base outline-none ring-ring transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2"
                    disabled={videoInfoMutation.isPending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={videoInfoMutation.isPending}
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {videoInfoMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  <span className="hidden sm:inline">{videoInfoMutation.isPending ? "Fetching..." : "Get Info"}</span>
                </button>
              </div>
              {urlError && <p className="mt-2 text-left text-sm text-destructive">{urlError}</p>}
            </form>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <AnimatePresence mode="wait">
          {videoInfoMutation.isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col md:flex-row">
                  <div className="aspect-video w-full animate-pulse bg-muted md:w-72" />
                  <div className="flex-1 space-y-3 p-4 md:p-6">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {videoInfoMutation.error && !downloadId && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center"
            >
              <XCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
              <p className="text-destructive">{videoInfoMutation.error.message}</p>
              <button onClick={handleReset} className="mt-4 inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent">
                Try Again
              </button>
            </motion.div>
          )}

          {videoInfo && !downloadId && (
            <motion.div
              key="video-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="overflow-hidden rounded-xl border bg-card">
                <div className="flex flex-col md:flex-row">
                  <div className="relative aspect-video w-full md:w-72 shrink-0">
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs text-white">
                      {formatDuration(videoInfo.duration)}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-4 md:p-6">
                    <h2 className="mb-2 line-clamp-2 text-lg font-semibold">{videoInfo.title}</h2>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{videoInfo.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {videoInfo.uploader}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatNumber(videoInfo.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(videoInfo.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload("mp4")}
                  disabled={downloadMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  <Download className="h-5 w-5" />
                  Download MP4
                </button>
                <button
                  onClick={() => handleDownload("mp3")}
                  disabled={downloadMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium transition-all hover:bg-accent disabled:opacity-50"
                >
                  <Download className="h-5 w-5" />
                  Download MP3
                </button>
              </div>
            </motion.div>
          )}

          {(downloadId || downloadMutation.isPending) && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border bg-card p-6 text-center"
            >
              {isFailed ? (
                <>
                  <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
                  <h3 className="mb-1 text-lg font-semibold">Download Failed</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {downloadData?.errorMessage || downloadMutation.error?.message || "An error occurred"}
                  </p>
                  <button
                    onClick={handleReset}
                    className="inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Try Again
                  </button>
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
                  <h3 className="mb-1 text-lg font-semibold">Ready to Download</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Your {selectedFormat?.toUpperCase()} file is ready.
                    {downloadData?.fileSize ? ` (${(downloadData.fileSize / 1024 / 1024).toFixed(1)} MB)` : ""}
                  </p>
                  <button
                    onClick={() => downloadId && downloadUrlMutation.mutate(downloadId)}
                    disabled={downloadUrlMutation.isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    {downloadUrlMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {downloadUrlMutation.isPending ? "Generating..." : "Download File"}
                  </button>
                </>
              ) : (
                <>
                  <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-primary" />
                  <h3 className="mb-1 text-lg font-semibold">Processing...</h3>
                  <p className="text-sm text-muted-foreground">
                    {downloadMutation.isPending ? "Starting download..." : `${downloadData?.progress || 0}% complete`}
                  </p>
                  {downloadData && (
                    <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadData.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Why Choose Us</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-xl border bg-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">How It Works</h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border bg-card">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl">
          <p className="flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            YouTube Downloader
          </p>
          <p className="mt-1">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
