import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { VideoInfo } from "@yds/shared/types";

const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  /(?:youtube\.com\/live\/)([\w-]{11})/,
];

function extractVideoId(url: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function ensureTempDir(): void {
  if (!existsSync(env.TEMP_DOWNLOAD_DIR)) {
    spawn("mkdir", ["-p", env.TEMP_DOWNLOAD_DIR]);
  }
}

function addCookieArgs(args: string[]): void {
  if (env.YT_COOKIES_FILE) {
    if (existsSync(env.YT_COOKIES_FILE)) {
      args.push("--cookies", env.YT_COOKIES_FILE);
    } else {
      logger.warn({ path: env.YT_COOKIES_FILE }, "YT_COOKIES_FILE not found, skipping");
    }
  }
  if (env.YT_COOKIES_FROM_BROWSER) {
    args.push("--cookies-from-browser", env.YT_COOKIES_FROM_BROWSER);
  }
}

const COMMON_ARGS = [
  "--extractor-args",
  "youtubetab:skip=webpage",
  "--user-agent",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
];

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  logger.info({ url }, "Fetching video info");

  const args = [
    "--dump-single-json",
    "--no-download",
    "--no-warnings",
    "--skip-download",
    "--no-playlist",
    "--restrict-filenames",
    "--socket-timeout",
    "30",
    "--retries",
    "10",
    "--retry-sleep",
    "5",
    "--extractor-retries",
    "10",
    "--throttled-rate",
    "100",
  ];

  addCookieArgs(args);
  args.push(...COMMON_ARGS);
  args.push(url);

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, LC_ALL: "en_US.UTF-8" },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      const elapsed = Date.now() - startTime;
      if (code === 0) {
        try {
          const data = JSON.parse(stdout);

          const videoInfo: VideoInfo = {
            id: String(data.id || ""),
            title: String(data.title || ""),
            description: String(data.description || ""),
            thumbnail: String(data.thumbnail || ""),
            duration: Number(data.duration || 0),
            uploader: String(data.uploader || ""),
            uploaderUrl: String(data.uploader_url || ""),
            views: Number(data.view_count || 0),
            uploadDate: String(data.upload_date || ""),
          };

          logger.info({ videoId: videoInfo.id, elapsed }, "Video info fetched successfully");
          resolve(videoInfo);
        } catch (parseError) {
          reject(new Error(`Failed to parse yt-dlp output: ${parseError}`));
        }
      } else {
        const errorMsg = stderr.slice(0, 1000);
        logger.error({ code, stderr: errorMsg }, "yt-dlp failed to fetch video info");
        reject(new Error(`yt-dlp exited with code ${code}: ${errorMsg}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn yt-dlp: ${err.message}`));
    });
  });
}

function buildYtdlArgs(url: string, format: string, videoId: string): string[] {
  const maxSizeBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024;
  const args = [
    "--no-warnings",
    "--no-playlist",
    "--restrict-filenames",
    "--print",
    "after_move:filepath",
    "-o",
    `${env.TEMP_DOWNLOAD_DIR}/${videoId}.%(ext)s`,
    "--retries",
    "10",
    "--retry-sleep",
    "5",
    "--extractor-retries",
    "10",
    "--throttled-rate",
    "100",
    "--max-filesize",
    String(maxSizeBytes),
  ];

  addCookieArgs(args);
  args.push(...COMMON_ARGS);

  if (format === "mp3") {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    args.push("-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b", "--merge-output-format", "mp4");
  }

  args.push(url);
  return args;
}

function awaitExistingFiles(dir: string, videoId: string, ext: string): string[] {
  const results: string[] = [];
  const expected = [`${videoId}.${ext}`, `${videoId}.m4a`, `${videoId}.webm`, `${videoId}.mkv`];
  for (const name of expected) {
    const p = path.join(dir, name);
    if (existsSync(p)) results.push(p);
  }
  return results;
}

export async function downloadVideo(
  url: string,
  format: string,
): Promise<{ filePath: string; title: string }> {
  ensureTempDir();

  const videoId = extractVideoId(url) || "video";
  const ext = format === "mp3" ? "mp3" : "mp4";
  const expectedPath = path.join(env.TEMP_DOWNLOAD_DIR, `${videoId}.${ext}`);

  const args = buildYtdlArgs(url, format, videoId);

  logger.info({ url, format }, "Starting download");

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
      const pct = extractProgress(data.toString());
      if (pct !== null) {
        logger.info({ progress: pct }, "Download progress");
      }
    });

    proc.on("close", (code) => {
      const elapsed = Date.now() - startTime;
      if (code === 0) {
        const printedPath = stdout.trim().split("\n").pop() || "";
        if (printedPath && existsSync(printedPath)) {
          logger.info({ filePath: printedPath, elapsed, format }, "Download completed");
          return resolve({ filePath: printedPath, title: videoId });
        }

        if (existsSync(expectedPath)) {
          logger.info({ filePath: expectedPath, elapsed, format }, "Download completed (expected path)");
          return resolve({ filePath: expectedPath, title: videoId });
        }

        const files = awaitExistingFiles(env.TEMP_DOWNLOAD_DIR, videoId, ext);
        if (files.length > 0) {
          logger.info({ filePath: files[0], elapsed, format }, "Download completed (scanned fallback)");
          return resolve({ filePath: files[0], title: videoId });
        }

        reject(new Error("The download completed but the output file could not be found. Please try again."));
      } else {
        const errorMsg = stderr.slice(-2000);
        logger.error({ code, elapsed, stderr: errorMsg }, "Download failed");

        if (errorMsg.includes("Video unavailable") || errorMsg.includes("This video is not available")) {
          reject(new Error("This video is unavailable or has been removed."));
        } else if (errorMsg.includes("Sign in") || errorMsg.includes("login")) {
          reject(new Error("This video requires sign-in and cannot be downloaded."));
        } else if (errorMsg.includes("copyright") || errorMsg.includes("blocked")) {
          reject(new Error("This video is copyright-restricted and cannot be downloaded."));
        } else if (errorMsg.includes("Private video")) {
          reject(new Error("This is a private video and cannot be downloaded."));
        } else if (errorMsg.includes("Too many requests") || errorMsg.includes("429")) {
          reject(new Error("Too many requests. Please wait a moment and try again."));
        } else if (errorMsg.includes("No video formats")) {
          reject(new Error("No downloadable formats found for this video."));
        } else {
          reject(new Error("Download failed. Please check the URL and try again."));
        }
      }
    });

    proc.on("error", () => {
      reject(new Error("Unable to start the download process. Please try again."));
    });
  });
}

function extractProgress(data: string): number | null {
  const match = data.match(/(\d+\.?\d*)%/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

export async function getVideoTitle(url: string): Promise<string> {
  const args = [
    "--print",
    "title",
    "--no-warnings",
    "--no-playlist",
    "--socket-timeout",
    "15",
    "--retries",
    "3",
  ];

  addCookieArgs(args);
  args.push(url);

  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, LC_ALL: "en_US.UTF-8" },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        const title = stdout.trim();
        resolve(title || "untitled");
      } else {
        const msg = stderr.slice(0, 500);
        reject(new Error(`yt-dlp title fetch failed (${code}): ${msg}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn yt-dlp for title: ${err.message}`));
    });
  });
}

export function getYtdlpVersion(): string {
  try {
    return execSync("yt-dlp --version", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

export function updateYtdlp(): { success: boolean; version: string } {
  try {
    execSync("yt-dlp -U", { stdio: "pipe", timeout: 60000 });
    const version = getYtdlpVersion();
    logger.info({ version }, "yt-dlp updated successfully");
    return { success: true, version };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ err: message }, "Failed to update yt-dlp");
    return { success: false, version: getYtdlpVersion() };
  }
}
