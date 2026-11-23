import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENV } from "./_core/env";
import { callDataInsight } from "./data-insight";

const fetchMock = vi.fn();
const originalUrl = ENV.dataInsightApiUrl;
const originalKey = ENV.dataInsightApiKey;
const originalCookieSecret = ENV.cookieSecret;
const originalVercelEnv = process.env.VERCEL_ENV;
const originalVercelUrl = process.env.VERCEL_URL;
const originalAppUrl = process.env.APP_URL;

describe("Data Insight service proxy", () => {
  beforeEach(() => {
    ENV.dataInsightApiUrl = "https://data-insight.example";
    ENV.dataInsightApiKey = "a".repeat(32);
    ENV.cookieSecret = originalCookieSecret;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.APP_URL;
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    ENV.dataInsightApiUrl = originalUrl;
    ENV.dataInsightApiKey = originalKey;
    ENV.cookieSecret = originalCookieSecret;
    if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = originalVercelEnv;
    if (originalVercelUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = originalVercelUrl;
    if (originalAppUrl === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = originalAppUrl;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reports non-JSON service errors without trying to parse them as JSON", async () => {
    fetchMock.mockResolvedValue(new Response("A server error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    }));

    await expect(callDataInsight("/api/assist/recommend", { query: "Sentinel-2" })).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: expect.stringContaining("risposta non JSON"),
    });
  });

  it("reports malformed JSON explicitly", async () => {
    fetchMock.mockResolvedValue(new Response("{invalid", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await expect(callDataInsight("/api/assist/recommend", { query: "Sentinel-2" })).rejects.toMatchObject({
      code: "BAD_GATEWAY",
      message: "Il servizio Data Insight ha restituito JSON non valido.",
    });
  });

  it("uses the protected same-deployment Python function for Preview requests", async () => {
    ENV.dataInsightApiUrl = "";
    ENV.dataInsightApiKey = "";
    ENV.cookieSecret = "s".repeat(32);
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "tatik-space-pro1-preview-tatikspace-beeps-projects.vercel.app";
    fetchMock.mockResolvedValue(new Response("{}", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await callDataInsight("/api/analyze", { value: 1 }, { cookieHeader: "vercel-session=test" });

    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe(
      "https://tatik-space-pro1-preview-tatikspace-beeps-projects.vercel.app/api/data_insight?path=%2Fapi%2Fanalyze",
    );
    expect(new Headers(options.headers).get("authorization")).toBe(`Bearer ${"s".repeat(32)}`);
    expect(new Headers(options.headers).get("cookie")).toBe("vercel-session=test");
  });

  it("uses the canonical domain for Production function requests", async () => {
    ENV.dataInsightApiUrl = "";
    ENV.dataInsightApiKey = "";
    ENV.cookieSecret = "s".repeat(32);
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "tatik-space-pro1-protected-tatikspace-beeps-projects.vercel.app";
    process.env.APP_URL = "https://www.tatik.space";
    fetchMock.mockResolvedValue(new Response("{}", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));

    await callDataInsight("/api/analyze", { value: 1 });

    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe(
      "https://www.tatik.space/api/data_insight?path=%2Fapi%2Fanalyze",
    );
    expect(new Headers(options.headers).get("authorization")).toBe(`Bearer ${"s".repeat(32)}`);
    expect(new Headers(options.headers).get("cookie")).toBeNull();
  });

  it("does not enable the internal function without a configured URL", async () => {
    ENV.dataInsightApiUrl = "";
    process.env.VERCEL_ENV = "production";
    delete process.env.VERCEL_URL;
    delete process.env.APP_URL;

    await expect(callDataInsight("/api/analyze", {})).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message: "Il servizio Data Insight non e configurato.",
    });
  });
});
