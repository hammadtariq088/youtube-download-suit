import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VideoInfo } from "@yds/shared/types";

export function useVideoInfo() {
  return useMutation<VideoInfo, Error, string>({
    mutationFn: async (url: string) => {
      return api.video.info({ url });
    },
  });
}
