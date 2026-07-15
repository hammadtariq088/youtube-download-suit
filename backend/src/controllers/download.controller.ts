import type { Request, Response, NextFunction } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { r2Client, R2_CONFIG } from "../config/r2.js";
import { downloads } from "../db/schema/index.js";
import { AppError } from "../middleware/error-handler.js";
import { logger } from "../config/logger.js";
import { JobStatus } from "@yds/shared/types";

export const downloadController = {
  async status(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const [download] = await db.select().from(downloads).where(eq(downloads.id, id)).limit(1);

      if (!download) {
        return next(new AppError(404, "Download not found. Check the download ID and try again.", "JOB_NOT_FOUND"));
      }

      res.json({
        success: true,
        data: {
          id: download.id,
          url: download.url,
          youtubeVideoId: download.youtubeVideoId,
          title: download.title,
          description: download.description,
          channelName: download.channelName,
          thumbnail: download.thumbnail,
          format: download.format,
          fileName: download.fileName,
          fileExtension: download.fileExtension,
          mimeType: download.mimeType,
          provider: download.provider,
          status: download.status,
          progress: download.progress,
          fileSize: download.fileSize,
          errorMessage: download.errorMessage,
          createdAt: download.createdAt,
          updatedAt: download.updatedAt,
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to get download status");
      next(new AppError(500, "Failed to get download status"));
    }
  },

  async url(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const [download] = await db.select().from(downloads).where(eq(downloads.id, id)).limit(1);

      if (!download) {
        return next(new AppError(404, "Download not found. Check the download ID and try again.", "JOB_NOT_FOUND"));
      }

      if (download.status !== JobStatus.COMPLETED || !download.r2Key) {
        return next(new AppError(400, "Download is still processing. Please wait and try again.", "DOWNLOAD_NOT_COMPLETED"));
      }

      const fileName = download.fileName || `${download.title || "video"}.${download.format}`;

      const command = new GetObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: download.r2Key,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
      });

      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: R2_CONFIG.signedUrlExpiry });

      logger.info({ downloadId: id, fileName }, "Signed URL generated");

      res.json({
        success: true,
        data: {
          fileName,
          format: download.format,
          downloadUrl: signedUrl,
          storage: "cloudflare-r2",
          downloadId: download.id,
          size: download.fileSize,
          provider: download.provider || "yt-dlp",
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Failed to generate download URL");
      next(new AppError(500, "Failed to generate download URL"));
    }
  },
};
