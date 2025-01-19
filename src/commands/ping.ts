import {
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

import Client from '..';
import Command from '../structures/Command';

/**
 * A command that reports the bot's current latency.
 */
export default new Command(
  /**
   * Defines the slash command for "ping".
   */
  (new SlashCommandBuilder)
    .setName('ping')
    .setDescription('Get the current latency of the bot'),
)
  /**
   * Sends an embed showing API and Gateway latency.
   */
  .on('run', async interaction => {
    const start = Date.now();

    return await interaction.reply({
      'embeds': [
        (new EmbedBuilder)
          .setTitle('🏓 Pong!')
          .setColor('Green')
          .addFields(
            { 'name': 'API Latency', 'value': `${Date.now() - start}ms`, 'inline': true, },
            { 'name': 'Gateway Latency', 'value': `${Client.ws.ping}ms`, 'inline': true, },
          )
          .setTimestamp(),
      ],
    });
  });
  
