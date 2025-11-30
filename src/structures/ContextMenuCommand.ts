import { EventEmitter } from '@3xpo/events';
import { logger } from '@utils/logger';
import { ContextMenuCommandBuilder } from 'discord.js';

import type { ContextMenuConfig, ContextMenuEvents } from '@typings/contextMenus';
import type { CommandGuard } from '@typings/guards';
import type { MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';

export class ContextMenuCommand<T extends ContextMenuCommandBuilder = ContextMenuCommandBuilder> extends EventEmitter<
  ContextMenuEvents<T>
> {
  public data: ContextMenuCommandBuilder;
  private readonly guards: CommandGuard[] = [];

  constructor(config: ContextMenuConfig) {
    super();
    this.data = config.builder(new ContextMenuCommandBuilder());

    if (config.guards !== undefined) this.guards = Array.isArray(config.guards) ? config.guards : [config.guards];
  }

  public run = (
    handler: (
      interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
    ) => Promise<void> | void,
  ): this => {
    this.on('run', async interaction => {
      try {
        for (const guard of this.guards) {
          const fn = typeof guard === 'function' ? guard : guard.execute?.bind(guard);
          if (fn === undefined) continue;

          const result = await fn(interaction as never);
          if (result.success === false) return;
        }

        await handler(interaction);
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));

        if (this.listenerCount('error') > 0) return this.emit('error', normalizedError, interaction);

        logger.error(normalizedError, `Error executing context menu ${this.data.name}`);

        const errorResponse = { 'content': `An error occurred: \`${normalizedError.message}\``, 'ephemeral': true };

        if (interaction.replied === true || interaction.deferred === true)
          return await interaction.followUp(errorResponse).catch(() => {});

        await interaction.reply(errorResponse).catch(() => {});
      }
    });
    return this;
  };

  public onError = (
    handler: (
      error: Error,
      interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
    ) => Promise<void> | void,
  ): this => {
    this.on('error', (error, interaction) =>
      Promise.resolve(handler(error, interaction)).catch(error =>
        logger.error(error, 'There was an error inside the error handler!'),
      ),
    );
    return this;
  };
}
