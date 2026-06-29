import { spawn } from "node:child_process";
import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { logger } from "../config/logger";

export interface ConversionResult {
  outputPath: string;
}

function getFfmpegArgs(inputPath: string, outputFormat: string, outputPath: string): string[] {
  const args = ["-i", inputPath, "-y"];

  switch (outputFormat) {
    case "mp3":
      args.push("-vn", "-acodec", "libmp3lame", "-q:a", "2");
      break;
    case "m4a":
      args.push("-vn", "-acodec", "aac", "-b:a", "192k");
      break;
    case "mp4":
      args.push("-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac", "-b:a", "128k");
      break;
    case "webm":
      args.push("-c:v", "libvpx", "-crf", "10", "-b:v", "1M", "-c:a", "libvorbis");
      break;
    case "mkv":
      args.push("-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac");
      break;
    default:
      args.push("-c", "copy");
  }

  args.push(outputPath);
  return args;
}

export async function convertFile(
  inputPath: string,
  outputFormat: string,
): Promise<ConversionResult> {
  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const baseName = inputPath.replace(/\.[^.]+$/, "");
  const outputPath = `${baseName}.${outputFormat}`;

  if (inputPath === outputPath || inputPath.endsWith(`.${outputFormat}`)) {
    logger.info({ inputPath, outputPath }, "No conversion needed, format matches");
    return { outputPath: inputPath };
  }

  const args = getFfmpegArgs(inputPath, outputFormat, outputPath);

  logger.info({ inputPath, outputFormat, args }, "Starting conversion");

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const proc = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      const pct = extractFfmpegProgress(text);
      if (pct !== null) {
        logger.info({ progress: pct }, "Conversion progress");
      }
    });

    proc.on("close", (code) => {
      const elapsed = Date.now() - startTime;
      if (code === 0) {
        logger.info({ outputPath, elapsed }, "Conversion completed");
        resolve({ outputPath });
      } else {
        const errorMsg = stderr.slice(-2000);
        logger.error({ code, elapsed, stderr: errorMsg }, "Conversion failed");
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to start FFmpeg: ${err.message}`));
    });
  });
}

function extractFfmpegProgress(data: string): number | null {
  const match = data.match(/time=(\d+):(\d+):(\d+)\.(\d+)/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
      logger.info({ filePath }, "Temporary file deleted");
    }
  } catch (error) {
    logger.warn({ err: error, filePath }, "Failed to delete temporary file");
  }
}
