import type { ApiResponse, VideoInfo, VideoInfoRequest, ConvertRequest, DownloadJob } from "@yds/shared/types";

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
  const token = localStorage.getItem("admin_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.error || "Request failed", (json as any).code);
  }

  return json.data as T;
}

export const api = {
  video: {
    info: (data: VideoInfoRequest) =>
      request<VideoInfo>("/video/info", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    convert: (data: ConvertRequest) =>
      request<{ id: string; status: string; pollUrl: string }>("/video/convert", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  download: {
    status: (id: string) => request<DownloadJob>(`/download/${id}`),
    url: (id: string) =>
      request<{ url: string; expiresIn: number; filename: string }>(`/download/${id}/url`),
  },
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    verify: () => request<{ user: { id: string; email: string; role: string } }>("/auth/verify"),
  },
  admin: {
    analytics: () => request<any>("/admin/analytics"),
    downloads: (page = 1, limit = 20) => request<any[]>(`/admin/downloads?page=${page}&limit=${limit}`),
    jobs: (page = 1, limit = 20) => request<any[]>(`/admin/jobs?page=${page}&limit=${limit}`),
    errors: (page = 1, limit = 20) => request<any[]>(`/admin/errors?page=${page}&limit=${limit}`),
    workerStatus: () => request<any>("/admin/worker/status"),
    queue: () => request<Record<string, any>>("/admin/queue"),
    storage: () => request<any>("/admin/storage"),
    retryJob: (id: string) => request<any>(`/admin/jobs/${id}/retry`, { method: "POST" }),
    deleteJob: (id: string) => request<any>(`/admin/jobs/${id}`, { method: "DELETE" }),
    clearQueue: (name: string) => request<any>(`/admin/queue/${name}/clear`, { method: "POST" }),
    updateYtdlp: () => request<any>("/admin/ytdlp/update", { method: "POST" }),
    cookies: {
      list: () => request<any[]>("/admin/cookies"),
      upload: (name: string, profile: string, content: string) =>
        request<any>("/admin/cookies", {
          method: "POST",
          body: JSON.stringify({ name, profile, content }),
        }),
      delete: (id: string) => request<any>(`/admin/cookies/${id}`, { method: "DELETE" }),
    },
  },
};
