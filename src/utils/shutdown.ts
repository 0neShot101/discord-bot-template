import { client } from '@services/database/mongodb';
import { redis } from '@services/database/redis';
import { logger } from '@utils/logger';

export const shutdown = async () => {
  logger.info('🔴 Shutting down...');

  await client.close();
  redis.close();

  process.exit(0);
};
