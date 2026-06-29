import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const queueActionSchema = z.object({
  name: z.enum(["download", "audio", "video", "cleanup", "retry", "video-info"]),
});
