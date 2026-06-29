import { describe, it, expect } from "vitest";

const API_URL = process.env.API_URL || "http://localhost:4000/api";

describe("Health API", () => {
  it("should return health status", async () => {
    const res = await fetch(`${API_URL}/health`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("status");
  });

  it("should return version info", async () => {
    const res = await fetch(`${API_URL}/health/version`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("version");
  });
});
