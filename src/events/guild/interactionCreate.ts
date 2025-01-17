import {
  InteractionType,
} from 'discord.js';

import Client from '../..';

import type CommandInteraction from '../../types/CommandInteraction';

/**
 * Defines the interaction event handling logic.
 * This event is triggered for each interaction with the bot. 
 * It checks the interaction type and executes the corresponding command.
**/
export default {
  /**
   * Specifies whether this event should be executed only once.
   * @type {boolean}
  **/
  'once': false,

  /**
   * The function to run when the event is triggered.
   * Handles the processing of each interaction.
   * 
   * @param {CommandInteraction} interaction - The interaction instance received from Discord.
   * @async
   * @returns {Promise<void>} A promise that resolves when the interaction has been processed.
  **/
  'run': async (interaction: CommandInteraction) => {

    /**
     * Check if the interaction type is an ApplicationCommand.
     * If it is, retrieve the command name and execute the corresponding command.
     * If the command is not found, return an error message.
     * If an error occurs during command execution, return the error message.
    **/
    if (interaction.type === InteractionType.ApplicationCommand) {
      const commandName: string = interaction.commandName;

      /* Retrieve the corresponding command from the Midnight client */
      const commands = await Client.Commands;
      const command = commands.get(interaction.commandName);

      /* Handle missing command name */
      if (commandName === undefined)
        return interaction.reply({ 'content': 'Error: Interaction object did not have a command name. Please try running the command again, and if the error persists, contact the bot owner.' });

      /* Handle command not found */
      if (command === undefined)
        return interaction.reply({ 'content': 'Error: Command not found. Please contact the bot owner as you should never see this error.' });

      try {
        await command.emit('run', interaction);
      } catch (error) {
        return interaction.reply({ 'content': `Error: ${error}`, });
      };
    };
  },
};
