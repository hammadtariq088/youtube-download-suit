import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { POLL_INTERVAL_MS } from "@yds/shared/constants";
import type { DownloadJob } from "@yds/shared/types";

export function useDownloadStatus(id: string | null) {
  return useQuery<DownloadJob>({
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
