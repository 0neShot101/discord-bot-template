import { client } from '@services/database/mongodb';
import { redis } from '@services/database/redis';
import { logger } from '@utils/logger';

export const shutdown = async () => {
  logger.info('🔴 Shutting down...');

  if (client !== undefined) await client.close().catch(() => {});
  await redis.close();

  process.exit(0);
};
