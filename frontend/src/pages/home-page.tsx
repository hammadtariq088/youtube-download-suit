import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadForm } from "@/components/features/download-form";
import { VideoInfoCard } from "@/components/features/video-info-card";
import { FormatSelector } from "@/components/features/format-selector";
import { AnimatedProgress } from "@/components/features/animated-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoInfo } from "@/hooks/use-video-info";
import { useDownload } from "@/hooks/use-download";
import { useDownloadStatus } from "@/hooks/use-download-status";
import { useDownloadUrl } from "@/hooks/use-download-url";
import { toast } from "@/components/ui/use-toast";
import { DownloadFormat, DownloadQuality } from "@yds/shared/types";
import { Download } from "lucide-react";

export function HomePage() {
  const [format, setFormat] = useState<DownloadFormat>(DownloadFormat.MP4);
  const [quality, setQuality] = useState<DownloadQuality>(DownloadQuality.BEST);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const videoInfoQuery = useVideoInfo();
  const downloadMutation = useDownload();
  const downloadStatus = useDownloadStatus(downloadId);
  const downloadUrlMutation = useDownloadUrl();

  function handleUrlSubmit(url: string) {
    setCurrentUrl(url);
    setDownloadId(null);
    videoInfoQuery.mutate(url);
  }

  function handleDownload() {
    if (!currentUrl) return;
    downloadMutation.mutate(
      { url: currentUrl, format, quality },
      {
        onSuccess: (data) => {
          setDownloadId(data.id);
          toast({ title: "Download started", description: "Your file is being processed." });
        },
        onError: (err) => {
          toast({ title: "Download failed", description: err.message, variant: "destructive" });
        },
      },
    );
  }

  function handleGetDownloadUrl() {
    if (!downloadId) return;
    downloadUrlMutation.mutate(downloadId, {
      onSuccess: (data) => {
        window.open(data.url, "_blank");
        toast({ title: "Download started", description: "Your file is downloading." });
      },
      onError: (err) => {
        toast({ title: "Failed to get download URL", description: err.message, variant: "destructive" });
      },
    });
  }

  const isCompleted = downloadStatus.data?.status === "completed";
  const isFailed = downloadStatus.data?.status === "failed";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
          YouTube Downloader
        </h1>
        <p className="text-lg text-muted-foreground">
          Download videos in high quality. Fast, free, and secure.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 w-full max-w-2xl"
      >
        <DownloadForm onSubmit={handleUrlSubmit} isLoading={videoInfoQuery.isPending} />
      </motion.div>

      <AnimatePresence mode="wait">
        {videoInfoQuery.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-32 w-56 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {videoInfoQuery.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-destructive">
              <CardContent className="p-6 text-center">
                <p className="text-destructive">{videoInfoQuery.error.message}</p>
                <Button variant="outline" className="mt-4" onClick={() => videoInfoQuery.reset()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {videoInfoQuery.data && !downloadId && (
          <motion.div
            key="video-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl space-y-4"
          >
            <VideoInfoCard info={videoInfoQuery.data} />

            <Card>
              <CardContent className="space-y-4 p-4">
                <FormatSelector
                  format={format}
                  quality={quality}
                  onFormatChange={setFormat}
                  onQualityChange={setQuality}
                />
                <Button onClick={handleDownload} className="w-full" size="lg" disabled={downloadMutation.isPending}>
                  <Download className="mr-2 h-5 w-5" />
                  {downloadMutation.isPending ? "Starting..." : "Download"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {downloadId && downloadStatus.data && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <AnimatedProgress
                  progress={downloadStatus.data.progress}
                  status={downloadStatus.data.status}
                  errorMessage={downloadStatus.data.errorMessage}
                />
                {isCompleted && (
                  <Button onClick={handleGetDownloadUrl} size="lg" className="mt-2" disabled={downloadUrlMutation.isPending}>
                    <Download className="mr-2 h-5 w-5" />
                    {downloadUrlMutation.isPending ? "Generating URL..." : "Download File"}
                  </Button>
                )}
                {isFailed && (
                  <Button variant="outline" onClick={() => setDownloadId(null)}>
                    Try Again
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
