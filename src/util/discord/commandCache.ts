import { Collection, } from 'discord.js';
import path from 'path';

import Bot from '../..';

import logger from '../logger';
import getAllFilePaths from '../getAllFilePaths';

import Command from '../../structures/Command';

/**
 * Asynchronously caches commands into a Collection for easy access and management.
 * This function scans the specified commands directory, dynamically imports each command,
 * and adds it to a Collection keyed by the command name.
 *
 * @param {string} [commandFolder=path.resolve('src', 'commands')] - The path to the folder containing command files.
 * @async
 * @returns {Promise<Collection<string, Command>>} A promise that resolves to a Collection of Command instances.
 */
export default async (
  commandFolder: string = path.resolve('src', 'commands'),
): Promise<Collection<string, Command>> => {
  const commands = (new Collection<string, Command>);
  const commandFiles = await getAllFilePaths(commandFolder);

  const importedCommands = await Promise.all(
    commandFiles.map(async (commandFile: string) => {
      const { 'default': command, } = await import(commandFile);

      const commandName = command.data?.name || path.parse(commandFile).name;

      return { commandName, command, };
    }),
  );

  for (const { commandName, command } of importedCommands) {
    logger.info(`[${Bot.config.name}] (Command): Loaded -> ${commandName}`);
  
    commands.set(commandName, command);
  };

  console.log('\n');
  
  return commands;
};
