import EventEmitter from '@3xpo/events';
import { format, } from 'util';
import {
  codeBlock,
  ChannelType,
  EmbedBuilder,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

import { Routes, } from 'discord-api-types/v10';

import type CommandInteraction from '../types/CommandInteraction';
import {
  type Command as CMD,
  type CommandEvent,
} from '../types/Command';

import logger from '../util/logger';

import Client from '..';

/**
 * Command class extending EventEmitter to handle Discord slash commands.
 *
 * @extends {EventEmitter} Inherits from EventEmitter to emit and listen to events.
 * @implements {CMD} Ensures implementation of the Command interface defined in `CommandEvent`.
 *
 * @example
 * // Usage example of the Command class.
 * import Command from '../structures';
 * import { SlashCommandBuilder } from 'discord.js';
 *
 * export default new Command(
 *   (new SlashCommandBuilder)
 *     .setName('ping')
 *     .setDescription('get the current latency of the bot'),
 * )
 * .on('run', async interaction =>
 *   await interaction.reply({ 'content': 'Pong!' }),
 * );
 **/
type CommandData = 
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export default class Command extends (EventEmitter as new () => CMD) {
  /**
   * The data for the slash command.
   *
   * @type {CommandData}
   */
  public data: CommandData;

  /**
   * Registers this command globally, making it available in all guilds.
   *
   * @returns {this} Returns the instance of the Command for chaining.
   */
  public globalRegister(): this {
    Client.rest.post(
      Routes.applicationCommands(Client.user?.id ?? ''),
      { 'body': this.data.toJSON() },
    );

    return this;
  };

  /**
   * Registers this command in a specific guild.
   *
   * @param {string} guildId - The guild ID where this command will be registered.
   * @returns {this} Returns the instance of the Command for chaining.
   */
  public guildRegister(guildId: string): this {
    Client.rest.post(
      Routes.applicationGuildCommands(Client.user?.id ?? '', guildId),
      { 'body': this.data.toJSON(), },
    );

    return this;
  };

  /**
   * Handles errors that occur during command execution. If in debug mode, logs the error.
   * Attempts to reply to the user with an error message as well.
   *
   * @private
   * @async
   * @param {Error} error - The error object caught during execution.
   * @param {CommandInteraction[]} args - The interaction arguments where the error occurred.
   * @returns {Promise<void>}
   */
  private async handleError(
    error: Error,
    args: CommandInteraction[],
  ): Promise<void> {
    const [ interaction, ] = args;

    if (Client.config.debug === true)
      logger.error(error);

    const errorEmbed = (new EmbedBuilder)
      .setTitle('Error')
      .setColor('Red')
      .setDescription(codeBlock('ts', error.message));

    try {
      if (interaction.replied === true)
        await interaction.followUp({ 'embeds': [ errorEmbed, ], });
      else
        await interaction.reply({ 'embeds': [ errorEmbed, ], });
    } catch (error) {
      if (interaction.channel && interaction.channel.type === ChannelType.GuildText)
        await interaction.channel.send({ 'embeds': [ errorEmbed, ], });
    };
  };

  /**
   * Safely executes a specified event listener, catching and handling errors to prevent crashes.
   *
   * @private
   * @async
   * @template K - The event key from CommandEvent.
   * @template F - The function type associated with that event key.
   * @param {K} event - The event name.
   * @param {F} listener - The listener function for the event.
   * @param {Parameters<F>} args - The arguments passed to the listener function.
   * @returns {Promise<void>}
   */
  private async safeEvent<K extends keyof CommandEvent, F extends CommandEvent[K]>(
    event: K,
    listener: F,
    args: Parameters<F>,
  ): Promise<void> {
    switch (true) /* Using switch(true) simplifies extending the Command class (e.g., adding a cooldown) by allowing additional cases without redundant checks  */ {
      default:
        try {
          await (listener as unknown as (...args: Parameters<F>) => Promise<never>)(...args);
        } catch (error) {
          if (!(error instanceof Error))
            error = new Error(format(error));

          await this.handleError(error as Error, args);
        };
    };
  };

  /**
   * Overrides the default `on` method from EventEmitter to safely handle command events.
   * 
   * @param {K} event - The event name (e.g., "run").
   * @param {CommandEvent[K]} listener - The callback function to run when the event is emitted.
   * @returns {this} Returns the current instance of the Command for method chaining.
   */
  public on<K extends keyof CommandEvent>(event: K, listener: CommandEvent[K]): this {
    return super.on(event, async (...args) =>
      this.safeEvent(event, listener, args as Parameters<CommandEvent[K]>),
    );
  };

  /**
   * Constructs a new Command instance.
   *
   * @constructor
   * @param {CommandData} data - The data for the slash command, excluding subcommands.
   */
  constructor(data: CommandData) {
    super();

    this.data = data;
  };
};
