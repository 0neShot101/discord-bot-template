import { Client } from '@structures/Client';
import { DISCORD_CLIENT_ID, DISCORD_DEVELOPMENT_GUILD_ID, DISCORD_TOKEN, NODE_ENV } from '@utils/environment';
import { logger } from '@utils/logger';
import { REST, Routes } from 'discord.js';

export const registerCommands = async (client: Client): Promise<void> => {
  const commands = client.commands.map(command => command.data.toJSON());
  const rest = new REST({ 'version': '10' }).setToken(DISCORD_TOKEN);

  const isProduction = NODE_ENV === 'production';
  const route = isProduction
    ? Routes.applicationCommands(DISCORD_CLIENT_ID)
    : Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_DEVELOPMENT_GUILD_ID);

  const scope = isProduction ? 'globally' : `to guild ${DISCORD_DEVELOPMENT_GUILD_ID}`;

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands ${scope}.`);

    await rest.put(route, { 'body': commands });

    logger.info(`🟢 Successfully reloaded ${commands.length} application (/) commands ${scope}.`);
  } catch (error) {
    logger.error(error, '🔴 Failed to reload application (/) commands.');
  }
};
