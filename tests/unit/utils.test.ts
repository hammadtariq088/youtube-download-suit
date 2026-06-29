import { describe, it, expect } from "vitest";
import { isValidYoutubeUrl } from "../../frontend/src/lib/utils";

describe("isValidYoutubeUrl", () => {
  it("should validate youtube.com/watch URLs", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(isValidYoutubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("should validate youtu.be short URLs", () => {
    expect(isValidYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  it("should validate youtube.com/embed URLs", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(true);
  });

  it("should validate youtube.com/shorts URLs", () => {
    expect(isValidYoutubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(true);
  });

  it("should reject invalid URLs", () => {
    expect(isValidYoutubeUrl("https://example.com")).toBe(false);
    expect(isValidYoutubeUrl("not a url")).toBe(false);
    expect(isValidYoutubeUrl("")).toBe(false);
  });
});
