import { Queue, QueueEvents } from "bullmq";
import { QUEUES } from "@yds/shared/constants";
import { getRedis } from "../config/redis";
import { logger } from "../config/logger";

function createQueue(name: string): Queue {
  const queue = new Queue(name, { connection: getRedis() });

  queue.on("error", (err) => {
    logger.error({ err, queue: name }, "Queue error");
  });

  return queue;
}

function createQueueEvents(name: string): QueueEvents {
  const events = new QueueEvents(name, { connection: getRedis() });

  events.on("error", (err) => {
    logger.error({ err, queue: name }, "QueueEvents error");
  });

  return events;
}

export const videoInfoQueue = createQueue(QUEUES.VIDEO_INFO);
export const downloadQueue = createQueue(QUEUES.DOWNLOAD);
export const audioQueue = createQueue(QUEUES.AUDIO);
export const videoQueue = createQueue(QUEUES.VIDEO);
export const cleanupQueue = createQueue(QUEUES.CLEANUP);
export const retryQueue = createQueue(QUEUES.RETRY);

export const videoInfoQueueEvents = createQueueEvents(QUEUES.VIDEO_INFO);
export const downloadQueueEvents = createQueueEvents(QUEUES.DOWNLOAD);

export const queues = {
  [QUEUES.VIDEO_INFO]: videoInfoQueue,
  [QUEUES.DOWNLOAD]: downloadQueue,
  [QUEUES.AUDIO]: audioQueue,
  [QUEUES.VIDEO]: videoQueue,
  [QUEUES.CLEANUP]: cleanupQueue,
  [QUEUES.RETRY]: retryQueue,
} as const;

export async function closeQueues(): Promise<void> {
  await Promise.all([
    ...Object.values(queues).map((q) => q.close()),
    videoInfoQueueEvents.close(),
    downloadQueueEvents.close(),
  ]);
}
