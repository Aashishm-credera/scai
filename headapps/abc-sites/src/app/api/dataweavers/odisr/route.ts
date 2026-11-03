/* eslint-disable */
import { AppRouterRegenerationProcessor } from '@dataweavers/spark-nextjs';
import { revalidatePath, revalidateTag } from 'next/cache';

const odrProcessor = new AppRouterRegenerationProcessor({
  ondemandRegenerationKey: process.env.SPARK_REGENERATION_SECRET || '',
});

export const { GET, POST } = odrProcessor.getHandler({ revalidatePath, revalidateTag });

/* 
For use with a the Dataweavers Redis cache handler, i.e. redis. 
Remove / comment the above implementation
Uncomment the implementation below * /

import { AppRouterRegenerationProcessor, RegeneratedItem } from '@dataweavers/spark-nextjs';
import { CacheService, logger } from '@dataweavers/redis-page-caching';

const cacheService = new CacheService();

async function onDeleteHandler(item: RegeneratedItem) {
  try {
    logger.info(`Received request to delete cache entry for key: ${item.path}`);
    await cacheService.delete(item.path);
    logger.info(`Deleted cache entry for key: ${item.path}`);
  } catch (err) {
    logger.error(`Failed to delete cache entry for key ${item.path}:`, err);
  }
}

const odrProcessorWithRedis = new AppRouterRegenerationProcessor({
  ondemandRegenerationKey: process.env.SPARK_REGENERATION_SECRET || '',
  observers: {
    onDelete: onDeleteHandler
  }
});

export const { GET, POST } = odrProcessorWithRedis.getHandler({ revalidatePath, revalidateTag });
/* eslint-enable */
