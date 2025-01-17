import { Routes, } from 'discord-api-types/v10';
import { 
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

import Client from '../..';

import logger from '../logger';

/**
 * Registers slash commands to the development guild if in development mode.
 * This function is intended to be used in a development environment to quickly
 * register commands for testing purposes.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export default async (): Promise<void> => {
  try {
    const devGuildId = process.env.developmentGuildID;

    /* Early exit if there's no dev guild ID or the client user is unavailable */
    if (devGuildId === undefined || !Client.user?.id) return;

    const [ commands, ] = await Promise.all([
      Client.Commands,
    ]);

    const slashCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
      commands.map(command => command.data.toJSON());

    await Client.rest.put(
      Routes.applicationGuildCommands(Client.user.id, devGuildId),
      { 'body': slashCommands, },
    );

    logger.info(`[${Client.config.name}] (Development): Slash Commands -> Registered (${devGuildId})`);
  } catch (error) {
    logger.error(error);
  };
};
