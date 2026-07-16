import { Queue, QueueEvents } from "bullmq";
import { QUEUES } from "@yds/shared/constants";
import { getRedis } from "../config/redis.js";
import { logger } from "../config/logger.js";

function createQueue(name: string): Queue {
  const queue = new Queue(name, {
    connection: getRedis(),
    defaultJobOptions: {
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 86400, count: 50 },
    },
  });

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
export const cleanupQueue = createQueue(QUEUES.CLEANUP);

export const videoInfoQueueEvents = createQueueEvents(QUEUES.VIDEO_INFO);
export const downloadQueueEvents = createQueueEvents(QUEUES.DOWNLOAD);

export async function closeQueues(): Promise<void> {
  await Promise.all([
    videoInfoQueue.close(),
    downloadQueue.close(),
    cleanupQueue.close(),
    videoInfoQueueEvents.close(),
    downloadQueueEvents.close(),
  ]);
}
