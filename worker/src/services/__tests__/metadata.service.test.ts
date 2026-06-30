import { describe, it, expect, vi, beforeEach } from "vitest";
import { MetadataService, MetadataServiceError } from "../metadata.service";
import { MetadataCache } from "../cache.service";
import { ApifyService } from "../apify.service";
import type { VideoInfo, VideoMetadataResult } from "@yds/shared/types";

vi.mock("../youtube.service", () => ({
  getVideoInfo: vi.fn(),
}));

import { getVideoInfo } from "../youtube.service";

const VALID_ID = "LXb3EKWsInQ";
const CACHED_ID = "cached-id-11";
const MISS_ID = "miss-id-11c";
const APIFY_ID = "apify-id-11c";
const RATE_LIMITED_ID = "rate-lim11id";
const AGE_RESTRICTED_ID = "age-rest-11id";
const PARSE_ERROR_ID = "parse-err-11d";
const NO_YTDLP_ID = "no-ytdlp-11id";
const BOTH_FAIL_ID = "both-fail-11id";
const NO_APIFY_ID = "no-apify-11id";

function validUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function createMockVideoInfo(overrides: Partial<VideoInfo> = {}): VideoInfo {
  return {
    id: VALID_ID,
    title: "Test Video",
    description: "A test video description",
    thumbnail: "https://i.ytimg.com/vi/test-id-123/default.jpg",
    duration: 300,
    uploader: "Test Channel",
    uploaderUrl: "https://youtube.com/@testchannel",
    views: 1000,
    uploadDate: "20240101",
    formats: [],
    qualities: [{ label: "Best Available", value: "best", formats: ["mp4"] }],
    ...overrides,
  };
}

const mockGetRedis = vi.fn();

function createCache(): MetadataCache {
  return new MetadataCache(mockGetRedis, 86400);
}

function createService(
  cache: MetadataCache,
  apify: ApifyService | null = null,
): MetadataService {
  return new MetadataService(apify, cache);
}

describe("MetadataService", () => {
  let cache: MetadataCache;
  let mockApify: ApifyService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRedis.mockReturnValue(null);
    cache = createCache();

    mockApify = {
      getVideoMetadata: vi.fn(),
    } as unknown as ApifyService;
  });

  describe("URL validation", () => {
    const service = createService(createCache());

    it("should accept valid youtube.com/watch URLs", () => {
      expect(service.isValidYoutubeUrl("https://www.youtube.com/watch?v=LXb3EKWsInQ")).toBe(true);
    });

    it("should accept youtu.be short URLs", () => {
      expect(service.isValidYoutubeUrl("https://youtu.be/LXb3EKWsInQ")).toBe(true);
    });

    it("should accept youtube.com/shorts URLs", () => {
      expect(service.isValidYoutubeUrl("https://www.youtube.com/shorts/LXb3EKWsInQ")).toBe(true);
    });

    it("should accept youtube.com/embed URLs", () => {
      expect(service.isValidYoutubeUrl("https://www.youtube.com/embed/LXb3EKWsInQ")).toBe(true);
    });

    it("should accept youtube.com/live URLs", () => {
      expect(service.isValidYoutubeUrl("https://www.youtube.com/live/LXb3EKWsInQ")).toBe(true);
    });

    it("should reject non-YouTube URLs", () => {
      expect(service.isValidYoutubeUrl("https://vimeo.com/123456")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(service.isValidYoutubeUrl("")).toBe(false);
    });

    it("should reject random text", () => {
      expect(service.isValidYoutubeUrl("not a url")).toBe(false);
    });
  });

  describe("video ID extraction", () => {
    const service = createService(createCache());

    it("should extract ID from youtube.com/watch", () => {
      expect(service.extractVideoId("https://www.youtube.com/watch?v=LXb3EKWsInQ")).toBe("LXb3EKWsInQ");
    });

    it("should extract ID from youtu.be", () => {
      expect(service.extractVideoId("https://youtu.be/LXb3EKWsInQ")).toBe("LXb3EKWsInQ");
    });

    it("should extract ID from shorts", () => {
      expect(service.extractVideoId("https://www.youtube.com/shorts/LXb3EKWsInQ")).toBe("LXb3EKWsInQ");
    });

    it("should extract ID from embed", () => {
      expect(service.extractVideoId("https://www.youtube.com/embed/LXb3EKWsInQ")).toBe("LXb3EKWsInQ");
    });

    it("should return null for invalid URL", () => {
      expect(service.extractVideoId("https://example.com")).toBe(null);
    });
  });

  describe("yt-dlp success", () => {
    it("should return metadata with yt-dlp provider", async () => {
      const mockInfo = createMockVideoInfo({ id: VALID_ID });
      vi.mocked(getVideoInfo).mockResolvedValue(mockInfo);

      const service = createService(cache, mockApify);
      const result = await service.getVideoMetadata(validUrl(VALID_ID));

      expect(result.provider).toBe("yt-dlp");
      expect(result.data).toEqual(mockInfo);
      expect(getVideoInfo).toHaveBeenCalledOnce();
      expect(mockApify.getVideoMetadata).not.toHaveBeenCalled();
    });
  });

  describe("cache hit", () => {
    it("should return cached metadata without calling providers", async () => {
      const cachedResult: VideoMetadataResult = {
        data: createMockVideoInfo({ id: CACHED_ID }),
        provider: "yt-dlp",
      };

      const mockRedis = {
        get: vi.fn().mockResolvedValue(JSON.stringify(cachedResult)),
        setex: vi.fn(),
        del: vi.fn(),
        status: "ready" as const,
      } as any;
      mockGetRedis.mockReturnValue(mockRedis);

      const service = createService(createCache(), mockApify);
      const result = await service.getVideoMetadata(validUrl(CACHED_ID));

      expect(result.provider).toBe("yt-dlp");
      expect(result.data.id).toBe(CACHED_ID);
      expect(getVideoInfo).not.toHaveBeenCalled();
      expect(mockApify.getVideoMetadata).not.toHaveBeenCalled();
    });
  });

  describe("cache miss", () => {
    it("should call yt-dlp when cache is empty", async () => {
      const mockRedis = {
        get: vi.fn().mockResolvedValue(null),
        setex: vi.fn(),
        del: vi.fn(),
        status: "ready" as const,
      } as any;
      mockGetRedis.mockReturnValue(mockRedis);

      const mockInfo = createMockVideoInfo({ id: MISS_ID });
      vi.mocked(getVideoInfo).mockResolvedValue(mockInfo);

      const service = createService(createCache(), mockApify);
      const result = await service.getVideoMetadata(validUrl(MISS_ID));

      expect(result.provider).toBe("yt-dlp");
      expect(mockRedis.setex).toHaveBeenCalled();
      expect(mockRedis.setex.mock.calls[0][0]).toBe(`metadata:${MISS_ID}`);
    });
  });

  describe("yt-dlp failure → Apify fallback", () => {
    it("should fall back to Apify when yt-dlp fails with bot detection", async () => {
      vi.mocked(getVideoInfo).mockRejectedValue(
        new Error("Sign in to confirm you're not a bot"),
      );

      const apifyInfo = createMockVideoInfo({ id: APIFY_ID, title: "Apify Title" });
      vi.mocked(mockApify.getVideoMetadata).mockResolvedValue(apifyInfo);

      const service = createService(cache, mockApify);
      const result = await service.getVideoMetadata(validUrl(APIFY_ID));

      expect(result.provider).toBe("apify");
      expect(result.data.title).toBe("Apify Title");
      expect(getVideoInfo).toHaveBeenCalledOnce();
      expect(mockApify.getVideoMetadata).toHaveBeenCalledOnce();
    });

    it("should fall back when yt-dlp gets HTTP 429", async () => {
      vi.mocked(getVideoInfo).mockRejectedValue(
        new Error("HTTP Error 429: Too Many Requests"),
      );

      const apifyInfo = createMockVideoInfo({ id: RATE_LIMITED_ID });
      vi.mocked(mockApify.getVideoMetadata).mockResolvedValue(apifyInfo);

      const service = createService(cache, mockApify);
      const result = await service.getVideoMetadata(validUrl(RATE_LIMITED_ID));

      expect(result.provider).toBe("apify");
    });

    it("should fall back when yt-dlp gets age restriction", async () => {
      vi.mocked(getVideoInfo).mockRejectedValue(
        new Error("This video is age restricted"),
      );

      const apifyInfo = createMockVideoInfo({ id: AGE_RESTRICTED_ID });
      vi.mocked(mockApify.getVideoMetadata).mockResolvedValue(apifyInfo);

      const service = createService(cache, mockApify);
      const result = await service.getVideoMetadata(validUrl(AGE_RESTRICTED_ID));

      expect(result.provider).toBe("apify");
    });

    it("should fall back when yt-dlp fails with parsing error", async () => {
      vi.mocked(getVideoInfo).mockRejectedValue(
        new Error("Failed to parse yt-dlp output"),
      );

      const apifyInfo = createMockVideoInfo({ id: PARSE_ERROR_ID });
      vi.mocked(mockApify.getVideoMetadata).mockResolvedValue(apifyInfo);

      const service = createService(cache, mockApify);
      const result = await service.getVideoMetadata(validUrl(PARSE_ERROR_ID));

      expect(result.provider).toBe("apify");
    });

    it("should not fall back for non-retryable errors", async () => {
      vi.mocked(getVideoInfo).mockRejectedValue(
        new Error("yt-dlp not found"),
      );

      const service = createService(cache, mockApify);
      await expect(
        service.getVideoMetadata(validUrl(NO_YTDLP_ID)),
      ).rejects.toThrow(MetadataServiceError);

      expect(mockApify.getVideoMetadata).not.toHaveBeenCalled();
    });
  });

  describe("both providers fail", () => {
    it("should throw MetadataServiceError when both fail", async () => {
      vi.mocked(getVideoInfo).mockRejectedValue(
        new Error("Sign in to confirm you're not a bot"),
      );
      vi.mocked(mockApify.getVideoMetadata).mockRejectedValue(
        new Error("Apify API error"),
      );

      const service = createService(cache, mockApify);
      await expect(
        service.getVideoMetadata(validUrl(BOTH_FAIL_ID)),
      ).rejects.toThrow(MetadataServiceError);

      await expect(
        service.getVideoMetadata(validUrl(BOTH_FAIL_ID)),
      ).rejects.toMatchObject({
        message: "Unable to fetch metadata.",
        code: "BOTH_PROVIDERS_FAILED",
      });
    });
  });

  describe("Apify not configured", () => {
    it("should throw if Apify is null and yt-dlp fails", async () => {
      vi.mocked(getVideoInfo).mockRejectedValue(
        new Error("Sign in to confirm you're not a bot"),
      );

      const service = createService(cache, null);
      await expect(
        service.getVideoMetadata(validUrl(NO_APIFY_ID)),
      ).rejects.toThrow(MetadataServiceError);

      await expect(
        service.getVideoMetadata(validUrl(NO_APIFY_ID)),
      ).rejects.toMatchObject({
        code: "BOTH_PROVIDERS_FAILED",
      });
    });
  });

  describe("invalid URL", () => {
    it("should throw MetadataServiceError for invalid URLs", async () => {
      const service = createService(cache, mockApify);

      await expect(
        service.getVideoMetadata("not-a-valid-url"),
      ).rejects.toThrow(MetadataServiceError);

      await expect(
        service.getVideoMetadata("not-a-valid-url"),
      ).rejects.toMatchObject({
        message: "Invalid YouTube URL",
        code: "INVALID_URL",
      });

      expect(getVideoInfo).not.toHaveBeenCalled();
      expect(mockApify.getVideoMetadata).not.toHaveBeenCalled();
    });
  });
});
