import { spawn, execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { VideoInfo, DownloadFormat, DownloadQuality } from "@yds/shared/types";

function ensureTempDir(): void {
  if (!existsSync(env.TEMP_DOWNLOAD_DIR)) {
    spawn("mkdir", ["-p", env.TEMP_DOWNLOAD_DIR]);
  }
}

function getCookiePath(): string | null {
  const activeProfile = process.env.COOKIE_PROFILE || "default";
  const cookiePath = path.join(env.TEMP_DOWNLOAD_DIR, `cookies_${activeProfile}.txt`);
  return existsSync(cookiePath) ? cookiePath : null;
}

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
    "3",
    "--extractor-retries",
    "3",
  ];

  const cookiePath = getCookiePath();
  if (cookiePath) {
    args.push("--cookies", cookiePath);
  }

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
          const formats = (data.formats || []).map((f: Record<string, unknown>) => ({
            formatId: String(f.format_id || ""),
            extension: String(f.ext || ""),
            resolution: f.resolution ? String(f.resolution) : null,
            filesize: f.filesize ? Number(f.filesize) : null,
            filesizeApprox: f.filesize_approx ? Number(f.filesize_approx) : null,
            bitrate: f.tbr ? Number(f.tbr) : null,
            fps: f.fps ? Number(f.fps) : null,
            codec: f.vcodec ? String(f.vcodec) : f.acodec ? String(f.acodec) : null,
            hasAudio: Boolean(f.acodec && f.acodec !== "none"),
            hasVideo: Boolean(f.vcodec && f.vcodec !== "none"),
            isAudioOnly: Boolean(f.vcodec === "none" || !f.vcodec),
          }));

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
            formats,
            qualities: generateQualityOptions(formats),
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

function generateQualityOptions(formats: Array<{ resolution: string | null; extension: string }>) {
  const options: Array<{ label: string; value: string; formats: string[] }> = [
    { label: "Best Available", value: "best", formats: [] },
  ];

  const qualities = ["1080", "720", "480", "360"];
  for (const q of qualities) {
    const matching = formats.filter((f) => {
      if (!f.resolution) return false;
      return f.resolution.includes(`${q}p`) || f.resolution.includes(`x${q}`);
    });
    if (matching.length > 0) {
      options.push({
        label: `${q}p`,
        value: `${q}p`,
        formats: matching.map((f) => f.extension),
      });
    }
  }

  return options;
}

export function buildYtdlArgs(
  url: string,
  format: DownloadFormat,
  quality: DownloadQuality,
): string[] {
  const args = [
    "--no-warnings",
    "--no-playlist",
    "--restrict-filenames",
    "--print",
    "after_move:filepath",
    "-o",
    `${env.TEMP_DOWNLOAD_DIR}/%(id)s.%(ext)s`,
  ];

  const cookiePath = getCookiePath();
  if (cookiePath) {
    args.push("--cookies", cookiePath);
  }

  if (format === "mp3" || format === "m4a") {
    args.push("-x", "--audio-format", format);
    if (quality === "best") {
      args.push("--audio-quality", "0");
    }
  } else {
    args.push("-f", "bestvideo+bestaudio/best");
    if (format === "mkv") {
      args.push("--merge-output-format", "mkv");
    } else if (format === "webm") {
      args.push("--merge-output-format", "webm");
    } else {
      args.push("--merge-output-format", "mp4");
    }
  }

  args.push(url);
  return args;
}

export async function downloadVideo(
  url: string,
  format: DownloadFormat,
  quality: DownloadQuality,
): Promise<{ filePath: string; title: string }> {
  ensureTempDir();

  const args = buildYtdlArgs(url, format, quality);

  logger.info({ url, format, quality }, "Starting download");

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

export async function writeCookieFile(name: string, content: string): Promise<string> {
  ensureTempDir();
  const filePath = path.join(env.TEMP_DOWNLOAD_DIR, `cookies_${name}.txt`);
  await writeFile(filePath, content, "utf-8");
  logger.info({ name, filePath }, "Cookie file written");
  return filePath;
}
