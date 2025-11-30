import { ContextMenuCommand } from '@structures/ContextMenuCommand';
import { ApplicationCommandType, MessageFlags } from 'discord.js';

/**
 * Example user context menu command demonstrating:
 * - Right-click on a user → Apps → "Get User Info"
 * - Accessing target user data
 *
 */
export const UserInfoContextMenu = new ContextMenuCommand({
  'builder': builder => builder.setName('Get User Info').setType(ApplicationCommandType.User),
}).run(async interaction => {
  if (!('targetUser' in interaction)) return;
  const user = interaction.targetUser;

  await interaction.reply({
    'content': `**User Info**\n> **Username:** ${user.username}\n> **ID:** ${user.id}\n> **Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
    'flags': MessageFlags.Ephemeral,
  });
});

/**
 * Example message context menu command demonstrating:
 * - Right-click on a message → Apps → "Quote Message"
 * - Accessing target message data
 */
export const QuoteMessageContextMenu = new ContextMenuCommand({
  'builder': builder => builder.setName('Quote Message').setType(ApplicationCommandType.Message),
}).run(async interaction => {
  if (!('targetMessage' in interaction)) return;
  const message = interaction.targetMessage;

  await interaction.reply({
    'content': `**Quote from ${message.author.username}:**\n> ${message.content || '*No text content*'}`,
    'flags': MessageFlags.Ephemeral,
  });
});
