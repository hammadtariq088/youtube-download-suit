import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDownloadUrl() {
  return useMutation({
    mutationFn: async (id: string) => {
      return api.download.url(id);
    },
  });
}
