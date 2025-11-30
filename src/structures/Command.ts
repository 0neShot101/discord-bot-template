import { EventEmitter } from '@3xpo/events';
import { logger } from '@utils/logger';
import { executeGuards, parseSubcommands, routeSubcommand } from '@utils/subCommandRouter';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import type { ParsedSubcommandConfig } from '@/utils/subCommandRouter';
import type { CommandBuilder, CommandConfig, CommandEvents } from '@typings/commands';
import type { CommandGuard } from '@typings/guards';

export class Command extends EventEmitter<CommandEvents> {
  public data: CommandBuilder;
  private readonly guards: CommandGuard[] = [];
  private readonly subcommands: Map<string, ParsedSubcommandConfig | Map<string, ParsedSubcommandConfig>>;

  /**
   * Creates a new Command instance.
   * @param config - The command configuration with builder and optional guards.
   */
  constructor(config: CommandConfig) {
    super();
    this.data = config.builder(new SlashCommandBuilder());

    if (config.guards !== undefined) this.guards = Array.isArray(config.guards) ? config.guards : [config.guards];

    if ('subcommands' in config) this.subcommands = parseSubcommands(config.subcommands);
    else this.subcommands = new Map();
  }

  /**
   * Registers the main handler for this command.
   * @param handler - The function to run when the command is triggered.
   */
  public run = (handler?: (interaction: ChatInputCommandInteraction) => Promise<void> | void): this => {
    this.on('run', async interaction => {
      try {
        const guardsPass = await executeGuards(this.guards, interaction);
        if (guardsPass === false) return;

        const handled = await routeSubcommand(interaction, this.subcommands);
        if (handled === true) return;

        if (handler !== undefined) await handler(interaction);
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));

        if (this.listenerCount('error') > 0) return this.emit('error', normalizedError, interaction);

        logger.error(normalizedError, `Error executing command ${interaction.commandName}`);

        const errorResponse = { 'content': `An error occurred: \`${normalizedError.message}\``, 'ephemeral': true };

        if (interaction.replied === true || interaction.deferred === true)
          return await interaction.followUp(errorResponse).catch(() => {});

        await interaction.reply(errorResponse).catch(() => {});
      }
    });
    return this;
  };

  /**
   * Registers a custom error handler for this command.
   * @param handler - The function to run when an error occurs during execution.
   */
  public onError = (
    handler: (error: Error, interaction: ChatInputCommandInteraction) => Promise<void> | void,
  ): this => {
    this.on('error', (error, interaction) =>
      Promise.resolve(handler(error, interaction)).catch(error =>
        logger.error(error, 'There was an error inside the error!'),
      ),
    );
    return this;
  };
}
