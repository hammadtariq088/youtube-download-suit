import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DownloadFormat, DownloadQuality } from "@yds/shared/types";

interface ConvertParams {
  url: string;
  format: DownloadFormat;
  quality: DownloadQuality;
}

export function useDownload() {
  return useMutation({
    mutationFn: async (params: ConvertParams) => {
      return api.video.convert({ url: params.url, format: params.format, quality: params.quality });
    },
  });
}
