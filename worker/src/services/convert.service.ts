import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { logger } from "../config/logger.js";

export interface ConversionResult {
  outputPath: string;
}

function getFfmpegArgs(inputPath: string, outputFormat: string, outputPath: string): string[] {
  const args = ["-i", inputPath, "-y"];

  if (outputFormat === "mp3") {
    args.push("-vn", "-acodec", "libmp3lame", "-q:a", "2");
  } else {
    args.push("-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac", "-b:a", "128k");
  }

  args.push(outputPath);
  return args;
}

export async function convertFile(
  inputPath: string,
  outputFormat: string,
): Promise<ConversionResult> {
  if (!existsSync(inputPath)) {
    throw new Error("The downloaded file could not be found for conversion. Please try again.");
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
    });

    proc.on("close", (code) => {
      const elapsed = Date.now() - startTime;
      if (code === 0) {
        logger.info({ outputPath, elapsed }, "Conversion completed");
        resolve({ outputPath });
      } else {
        const errorMsg = stderr.slice(-2000);
        logger.error({ code, elapsed, stderr: errorMsg }, "Conversion failed");

        if (errorMsg.includes("Invalid data found when processing")) {
          reject(new Error("The downloaded file appears to be corrupted. Please try again."));
        } else if (errorMsg.includes("codec not supported") || errorMsg.includes("not implemented")) {
          reject(new Error("The video format is not supported for conversion. Please try a different video."));
        } else if (errorMsg.includes("No such file or directory")) {
          reject(new Error("The downloaded file could not be found. Please try again."));
        } else {
          reject(new Error("Conversion failed. The file could not be processed. Please try again."));
        }
      }
    });

    proc.on("error", () => {
      reject(new Error("Unable to start the conversion process. Please try again."));
    });
  });
}
