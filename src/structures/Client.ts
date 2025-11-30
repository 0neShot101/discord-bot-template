import { loadCommands } from '@handlers/commands';
import { loadEvents } from '@handlers/events';
import { loadInteractions } from '@handlers/interactions';
import { DEFAULT_INTENTS, DEFAULT_PARTIALS } from '@utils/constants';
import { DISCORD_TOKEN } from '@utils/environment';
import { logger } from '@utils/logger';
import { registerCommands } from '@utils/registerCommands';
import { Client, ClientOptions, Collection } from 'discord.js';

import type { Interaction } from '@structures/Interaction';
import type { CommandCollection } from '@typings/commands';
import type { InteractionType } from '@typings/interactions';

class BotClient extends Client {
  public commands: CommandCollection = new Collection();
  public interactions: Interaction<InteractionType>[] = [];

  constructor(options?: ClientOptions) {
    super({
      'intents': options?.intents ?? DEFAULT_INTENTS,
      'partials': options?.partials ?? DEFAULT_PARTIALS,
      ...options,
    });
  }

  public run = async (): Promise<void> => {
    try {
      await loadCommands(this);
      await loadInteractions(this);
      await loadEvents(this);
      await registerCommands(this);
      await this.login(DISCORD_TOKEN);
    } catch (error) {
      logger.fatal(error, '🔴 Failed to login client');
      throw error;
    }
  };
}

export { BotClient as Client };
