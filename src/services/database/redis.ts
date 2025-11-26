import { logger } from '@utils/logger';
import { RedisClient } from 'bun';

/**
  Default to localhost if not provided, but Bun handles REDIS_URL automatically.
  We wrap this to provide a consistent singleton and logging.
*/

export const redis = new RedisClient();

logger.info('🟢 Redis client initialized (lazy connection)');
