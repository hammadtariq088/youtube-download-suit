import type { ApiResponse, VideoInfo } from "@yds/shared/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.error || "Request failed", (json as any).code);
  }

  return json.data as T;
}

export const api = {
  video: {
    info: (url: string) =>
      request<VideoInfo>("/video/info", {
        method: "POST",
        body: JSON.stringify({ url }),
      }),
    convert: (url: string, format: string) =>
      request<{ id: string; status: string; pollUrl: string }>("/video/convert", {
        method: "POST",
        body: JSON.stringify({ url, format }),
      }),
  },
  download: {
    status: (id: string) =>
      request<{
        id: string;
        url: string;
        youtubeVideoId: string | null;
        title: string | null;
        description: string | null;
        channelName: string | null;
        thumbnail: string | null;
        format: string;
        fileName: string | null;
        fileExtension: string | null;
        mimeType: string | null;
        provider: string | null;
        status: string;
        progress: number;
        fileSize: number | null;
        errorMessage: string | null;
        createdAt: string;
        updatedAt: string;
      }>(`/download/${id}`),
    url: (id: string) =>
      request<{
        downloadUrl: string;
        fileName: string;
        format: string;
        storage: string;
        downloadId: string;
        size: number | null;
        provider: string;
      }>(`/download/${id}/url`),
  },
};
