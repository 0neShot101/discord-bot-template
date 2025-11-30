import { GuardBuilder } from '@structures/Guard';
import { MessageFlags, PermissionFlagsBits, PermissionsBitField } from 'discord.js';

import type { PermissionResolvable } from 'discord.js';

/**
 * Requires the user to have specific permissions.
 */
export const requirePermissions = (...permissions: PermissionResolvable[]) =>
  new GuardBuilder().run(async (interaction, next) => {
    if (interaction.guild === null) {
      await interaction.reply({
        'content': 'This command can only be used in servers.',
        'flags': MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.member;
    if (member === null) {
      await interaction.reply({ 'content': 'Could not verify your permissions.', 'flags': MessageFlags.Ephemeral });
      return;
    }

    const memberPermissions = member.permissions;
    if (memberPermissions instanceof PermissionsBitField === false) {
      await interaction.reply({ 'content': 'Could not verify your permissions.', 'flags': MessageFlags.Ephemeral });
      return;
    }

    const missing = memberPermissions.missing(permissions);
    if (missing.length === 0) return next();

    const formatted = missing.map(p => `\`${p}\``).join(', ');
    await interaction.reply({
      'content': `You need the following permissions: ${formatted}`,
      'flags': MessageFlags.Ephemeral,
    });
  });

/**
 * Requires the bot to have specific permissions.
 */
export const requireBotPermissions = (...permissions: PermissionResolvable[]) =>
  new GuardBuilder().run(async (interaction, next) => {
    if (interaction.guild === null) {
      await interaction.reply({
        'content': 'This command can only be used in servers.',
        'flags': MessageFlags.Ephemeral,
      });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (botMember === null) {
      await interaction.reply({ 'content': 'Could not verify bot permissions.', 'flags': MessageFlags.Ephemeral });
      return;
    }

    const missing = botMember.permissions.missing(permissions);
    if (missing.length === 0) return next();

    const formatted = missing.map(p => `\`${p}\``).join(', ');
    await interaction.reply({
      'content': `I need the following permissions: ${formatted}`,
      'flags': MessageFlags.Ephemeral,
    });
  });

/**
 * Requires the user to be a server administrator.
 */
export const adminOnly = requirePermissions(PermissionFlagsBits.Administrator);

/**
 * Requires the user to have moderation permissions (Kick, Ban, or Moderate Members).
 */
export const modOnly = new GuardBuilder().run(async (interaction, next) => {
  if (interaction.guild === null) {
    await interaction.reply({
      'content': 'This command can only be used in servers.',
      'flags': MessageFlags.Ephemeral,
    });
    return;
  }

  const member = interaction.member;
  if (member === null || member.permissions instanceof PermissionsBitField === false) {
    await interaction.reply({ 'content': 'Could not verify your permissions.', 'flags': MessageFlags.Ephemeral });
    return;
  }

  const hasModPerms =
    member.permissions.has(PermissionFlagsBits.KickMembers) === true ||
    member.permissions.has(PermissionFlagsBits.BanMembers) === true ||
    member.permissions.has(PermissionFlagsBits.ModerateMembers) === true;

  if (hasModPerms === true) return next();

  await interaction.reply({
    'content': 'You need moderation permissions to use this command.',
    'flags': MessageFlags.Ephemeral,
  });
});

/**
 * Requires the user to have Manage Guild permission.
 */
export const manageGuildOnly = requirePermissions(PermissionFlagsBits.ManageGuild);

/**
 * Requires the user to have Manage Channels permission.
 */
export const manageChannelsOnly = requirePermissions(PermissionFlagsBits.ManageChannels);

/**
 * Requires the user to have Manage Roles permission.
 */
export const manageRolesOnly = requirePermissions(PermissionFlagsBits.ManageRoles);

/**
 * Requires the user to have Manage Messages permission.
 */
export const manageMessagesOnly = requirePermissions(PermissionFlagsBits.ManageMessages);
