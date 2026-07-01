import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { VideoInfo } from "@yds/shared/types";

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

function buildYtdlArgs(url: string, format: string): string[] {
  const args = [
    "--no-warnings",
    "--no-playlist",
    "--restrict-filenames",
    "--print",
    "after_move:filepath",
    "-o",
    `${env.TEMP_DOWNLOAD_DIR}/%(id)s.%(ext)s`,
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

  if (format === "mp3") {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    args.push("-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b", "--merge-output-format", "mp4");
  }

  args.push(url);
  return args;
}

export async function downloadVideo(
  url: string,
  format: string,
): Promise<{ filePath: string; title: string }> {
  ensureTempDir();

  const args = buildYtdlArgs(url, format);

  logger.info({ url, format }, "Starting download");

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      output += data.toString();
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
        const filename = output.trim().split("\n").pop() || "";
        const filePath = path.join(env.TEMP_DOWNLOAD_DIR, path.basename(filename));
        const title = path.basename(filename, path.extname(filename));

        logger.info({ filePath, elapsed, format }, "Download completed");
        resolve({ filePath, title });
      } else {
        const errorMsg = stderr.slice(-2000);
        logger.error({ code, elapsed, stderr: errorMsg }, "Download failed");
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}`));
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
