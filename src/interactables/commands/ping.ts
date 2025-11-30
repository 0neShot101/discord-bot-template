import { guildOnly } from '@guards/channel';
import { cooldown } from '@guards/cooldown';
import { Command } from '@structures/Command';
import { MessageFlags } from 'discord.js';

/**
 * Example command demonstrating the template features:
 * - Guard middleware (cooldown, guildOnly)
 * - Slash command builder
 *
 * @see src/guards/ for available guards
 */
export const PingCommand = new Command({
  'builder': builder => builder.setName('ping').setDescription('Replies with Pong!'),
  'guards': [guildOnly, cooldown(5, 'user')],
}).run(async interaction => {
  const latency = Date.now() - interaction.createdTimestamp;
  const apiLatency = Math.round(interaction.client.ws.ping);

  await interaction.reply({
    'content': `Pong!\n> **Latency:** ${latency}ms\n> **API Latency:** ${apiLatency}ms`,
    'flags': MessageFlags.Ephemeral,
  });
});
