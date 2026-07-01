import type { VideoInfo } from "@yds/shared/types";
import { logger } from "../config/logger";
import { withRetry } from "../utils/retry";

export const DEFAULT_APIFY_ACTOR_ID = "nFATNwHCkQv3c3H9cn";
const APIFY_BASE_URL = "https://api.apify.com/v2";

export interface ApifyVideoItem {
  title?: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  channelName?: string;
  channelId?: string;
  channelUrl?: string;
  uploadDate?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  tags?: string[];
  categories?: string[];
  language?: string;
  availability?: string;
  isLive?: boolean;
  width?: number;
  height?: number;
}

export interface ApifyRunInfo {
  id: string;
  status: string;
  datasetId?: string;
  defaultDatasetId?: string;
}

export interface ApifyErrorResponse {
  error?: { message?: string; type?: string };
}

export class ApifyServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApifyServiceError";
  }
}

export class ApifyService {
  private readonly token: string;
  private readonly actorId: string;

  constructor(token: string, actorId: string = DEFAULT_APIFY_ACTOR_ID) {
    if (!token) {
      throw new ApifyServiceError("APIFY_TOKEN is not configured", "MISSING_TOKEN");
    }
    this.token = token;
    this.actorId = actorId;
  }

  private get baseHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  private async request<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: { ...this.baseHeaders, ...(options.headers as Record<string, string>) },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as ApifyErrorResponse;
      const message = body?.error?.message || `Apify API returned status ${response.status}`;
      throw new ApifyServiceError(message, `APIFY_HTTP_${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async startRun(url: string): Promise<string> {
    const actorEndpoint = `${APIFY_BASE_URL}/acts/${this.actorId}/runs`;

    const body = {
      startUrls: [{ url }],
      maxResults: 1,
    };

    const response = await this.request<{ data: ApifyRunInfo }>(actorEndpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return response.data.id;
  }

  async waitForFinish(runId: string): Promise<ApifyRunInfo> {
    const maxWaitSeconds = 120;
    const endpoint = `${APIFY_BASE_URL}/actor-runs/${runId}/wait?waitForFinish=${maxWaitSeconds}`;

    const response = await this.request<{ data: ApifyRunInfo }>(endpoint);
    const run = response.data;

    if (run.status === "FAILED" || run.status === "ABORTED" || run.status === "TIMED-OUT") {
      throw new ApifyServiceError(
        `Apify run failed with status: ${run.status}`,
        `APIFY_RUN_${run.status}`,
      );
    }

    if (run.status !== "SUCCEEDED") {
      throw new ApifyServiceError(
        `Apify run did not complete within timeout. Status: ${run.status}`,
        "APIFY_RUN_TIMEOUT",
      );
    }

    return run;
  }

  async getDatasetItems(datasetId: string): Promise<ApifyVideoItem[]> {
    const endpoint = `${APIFY_BASE_URL}/datasets/${datasetId}/items?format=json&limit=1`;

    const response = await this.request<ApifyVideoItem[]>(endpoint);
    return response;
  }

  normalizeToVideoInfo(item: ApifyVideoItem, sourceUrl: string): VideoInfo {
    const duration = item.duration ?? 0;
    const videoId = this.extractVideoId(sourceUrl) || item.channelId || "";

    return {
      id: videoId,
      title: item.title ?? "Unknown Title",
      description: item.description ?? "",
      thumbnail: item.thumbnailUrl ?? "",
      duration,
      uploader: item.channelName ?? "Unknown",
      uploaderUrl: item.channelUrl ?? "",
      views: item.viewCount ?? 0,
      uploadDate: item.uploadDate ?? "",
    };
  }

  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
      /(?:youtu\.be\/)([\w-]{11})/,
      /(?:youtube\.com\/embed\/)([\w-]{11})/,
      /(?:youtube\.com\/shorts\/)([\w-]{11})/,
      /(?:youtube\.com\/live\/)([\w-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  async getVideoMetadata(sourceUrl: string): Promise<VideoInfo> {
    logger.info({ url: sourceUrl }, "Starting Apify metadata fetch");

    const runId = await withRetry(
      () => this.startRun(sourceUrl),
      {
        maxRetries: 2,
        baseDelayMs: 2000,
        shouldRetry: (error) =>
          error instanceof ApifyServiceError &&
          (error.message.includes("timeout") || error.message.includes("500")),
      },
    );

    const run = await this.waitForFinish(runId);
    const datasetId = run.defaultDatasetId;
    if (!datasetId) {
      throw new ApifyServiceError(
        "Apify run completed but no dataset ID returned",
        "MISSING_DATASET",
      );
    }

    const items = await withRetry(
      () => this.getDatasetItems(datasetId),
      {
        maxRetries: 2,
        baseDelayMs: 1000,
      },
    );

    if (!items || items.length === 0) {
      throw new ApifyServiceError(
        "Apify returned no results for the given URL",
        "NO_RESULTS",
      );
    }

    const videoInfo = this.normalizeToVideoInfo(items[0], sourceUrl);
    logger.info({ videoId: videoInfo.id, title: videoInfo.title }, "Apify metadata fetch succeeded");

    return videoInfo;
  }
}
