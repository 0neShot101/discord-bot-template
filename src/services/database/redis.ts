import { REDIS_URL } from '@utils/environment';
import { logger } from '@utils/logger';
import { RedisClient } from 'bun';

class RedisCache {
  private client: RedisClient | undefined;
  private readonly fallback = new Map<string, string | number | Buffer>();

  public connect = async (): Promise<void> => {
    try {
      const instance = new RedisClient(REDIS_URL, {
        'maxRetries': 1,
      });
      await instance.connect();
      await instance.ping();
      this.client = instance;
      logger.info('🟢 Connected to Redis');
    } catch {
      this.client = undefined;
      logger.warn('🟠 Using in-memory cache after Redis connection failed');
    }
  };

  private closeClient = async (): Promise<void> => {
    if (this.client === undefined) return;

    try {
      this.client.close();
    } catch (error) {
      logger.error(error, '🔴 Failed to close Redis client');
    }

    this.client = undefined;
  };

  public usingFallback = (): boolean => this.client === undefined;

  public get = async (key: string): Promise<string | number | Buffer | undefined> => {
    if (this.client === undefined) return this.fallback.get(key);

    const value = await this.client.get(key);
    return value ?? undefined;
  };

  public set = async (key: string, value: string | number | Buffer): Promise<void> => {
    if (this.client === undefined) {
      this.fallback.set(key, value);
      return;
    }

    await this.client.set(key, String(value));
  };

  public delete = async (key: string): Promise<boolean> => {
    if (this.client === undefined) return this.fallback.delete(key);

    const removed = await this.client.del(key);
    return removed > 0;
  };

  public clear = async (): Promise<void> => {
    if (this.client === undefined) {
      this.fallback.clear();
      return;
    }

    await this.client.send('FLUSHDB', []);
  };

  public close = async (): Promise<void> => {
    if (this.client !== undefined) await this.closeClient();
    this.fallback.clear();
  };
}

export const redis = new RedisCache();
await redis.connect();
