import { describe, it, expect } from "vitest";
import { DownloadFormat, DownloadQuality } from "@yds/shared/types";

describe("DownloadFormat enum", () => {
  it("should have expected values", () => {
    expect(DownloadFormat.MP4).toBe("mp4");
    expect(DownloadFormat.MP3).toBe("mp3");
    expect(DownloadFormat.M4A).toBe("m4a");
    expect(DownloadFormat.WEBM).toBe("webm");
    expect(DownloadFormat.MKV).toBe("mkv");
  });
});

describe("DownloadQuality enum", () => {
  it("should have expected values", () => {
    expect(DownloadQuality.BEST).toBe("best");
    expect(DownloadQuality._1080P).toBe("1080p");
    expect(DownloadQuality._720P).toBe("720p");
    expect(DownloadQuality._480P).toBe("480p");
    expect(DownloadQuality._360P).toBe("360p");
  });
});
