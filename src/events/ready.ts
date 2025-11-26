import { Event } from '@structures/Event';
import { logger } from '@utils/logger';

export const ready = new Event('clientReady', true).run(client => {
  logger.info(`🟢 Logged in as ${client.user.tag}`);
});
