import { loadEvents } from '@handlers/events';
import { DEFAULT_INTENTS, DEFAULT_PARTIALS } from '@utils/constants';
import { DISCORD_TOKEN } from '@utils/environment';
import { logger } from '@utils/logger';
import { Client, ClientOptions } from 'discord.js';

class BotClient extends Client {
  constructor(options?: ClientOptions) {
    super({
      'intents': options?.intents ?? DEFAULT_INTENTS,
      'partials': options?.partials ?? DEFAULT_PARTIALS,
      ...options,
    });
  }

  public run = async (): Promise<void> => {
    try {
      await loadEvents(this);
      await this.login(DISCORD_TOKEN);
    } catch (error) {
      logger.fatal(error, '❌ Failed to login client');
      throw error;
    }
  };
}

export { BotClient as Client };
