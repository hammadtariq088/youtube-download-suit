import { z } from "zod";
import { DownloadFormat } from "@yds/shared/types";

const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

export const videoInfoSchema = z.object({
  url: z.string().regex(youtubeUrlRegex, "Invalid YouTube URL"),
});

export const convertSchema = z.object({
  url: z.string().regex(youtubeUrlRegex, "Invalid YouTube URL"),
  format: z.nativeEnum(DownloadFormat),
});
