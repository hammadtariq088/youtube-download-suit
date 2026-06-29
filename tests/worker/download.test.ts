import { describe, it, expect, vi } from "vitest";

vi.mock("child_process", () => ({
  spawn: vi.fn(),
  execSync: vi.fn(() => "2025.01.01"),
}));

describe("YouTube Service", () => {
  it("should build ytdl args for mp4 download", async () => {
    const { buildYtdlArgs } = await import("../../worker/src/services/youtube.service");
    const args = buildYtdlArgs("https://youtu.be/test", "mp4" as any, "720p" as any);
    expect(args).toContain("--no-warnings");
    expect(args).toContain("--no-playlist");
  });

  it("should build ytdl args for mp3 download", async () => {
    const { buildYtdlArgs } = await import("../../worker/src/services/youtube.service");
    const args = buildYtdlArgs("https://youtu.be/test", "mp3" as any, "best" as any);
    expect(args).toContain("-x");
    expect(args).toContain("--audio-format");
    expect(args).toContain("mp3");
  });
});
