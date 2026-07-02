import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { isValidYoutubeUrl } from "@/lib/utils";
import { POLL_INTERVAL_MS } from "@yds/shared/constants";
import type { VideoInfo } from "@yds/shared/types";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FAQ } from "@/components/sections/faq";
import { VideoSkeleton } from "@/components/ui/video-skeleton";
import { VideoInfoCard } from "@/components/ui/video-info-card";
import { DownloadProgress } from "@/components/ui/download-progress";

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
      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = data.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  });

  const downloadStatus = useDownloadStatus(downloadId);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setUrlError("");
    setDownloadId(null);
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
    downloadMutation.mutate({ url: url.trim(), format });
  }, [url, downloadMutation]);

  const handleReset = useCallback(() => {
    videoInfoMutation.reset();
    downloadMutation.reset();
    downloadUrlMutation.reset();
    setDownloadId(null);
  }, [videoInfoMutation, downloadMutation, downloadUrlMutation]);

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    if (urlError) setUrlError("");
  }, [urlError]);

  const videoInfo = videoInfoMutation.data;
  const downloadData = downloadStatus.data;
  const isCompleted = downloadData?.status === "completed";
  const isFailed = downloadData?.status === "failed" || downloadMutation.isError;

  return (
    <main>
      <Hero
        url={url}
        urlError={urlError}
        isPending={videoInfoMutation.isPending}
        onUrlChange={handleUrlChange}
        onSubmit={handleSubmit}
      />

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <AnimatePresence mode="wait">
          {videoInfoMutation.isPending && <VideoSkeleton />}

          {videoInfoMutation.error && !downloadId && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <p className="text-sm text-destructive">{videoInfoMutation.error.message}</p>
              <button
                onClick={handleReset}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-secondary active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          )}

          {videoInfo && !downloadId && (
            <VideoInfoCard
              videoInfo={videoInfo}
              isDownloadPending={downloadMutation.isPending}
              onDownload={handleDownload}
              error={downloadMutation.error}
            />
          )}

          {(downloadId || downloadMutation.isPending) && (
            <DownloadProgress
              isPending={downloadMutation.isPending}
              isFailed={isFailed}
              isCompleted={isCompleted}
              progress={downloadData?.progress || 0}
              errorMessage={downloadData?.errorMessage || downloadMutation.error?.message || null}
              isDownloadUrlPending={downloadUrlMutation.isPending}
              onDownloadFile={() => downloadId && downloadUrlMutation.mutate(downloadId)}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </section>

      <Features />
      <HowItWorks />
      <FAQ />
    </main>
  );
}
