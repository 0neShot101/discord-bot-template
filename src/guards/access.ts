import { GuardBuilder } from '@structures/Guard';
import { GuildMemberRoleManager, MessageFlags } from 'discord.js';

/**
 * Restricts the command to specific owner user IDs.
 */
export const ownerOnly = (...ownerIds: string[]) =>
  new GuardBuilder().run(async (interaction, next) => {
    if (ownerIds.includes(interaction.user.id) === true) return next();

    await interaction.reply({ 'content': 'Only the bot owner can use this command.', 'flags': MessageFlags.Ephemeral });
  });

/**
 * Restricts the command to specific user IDs.
 */
export const allowUsers = (...userIds: string[]) =>
  new GuardBuilder().run(async (interaction, next) => {
    if (userIds.includes(interaction.user.id) === true) return next();

    await interaction.reply({ 'content': 'You are not allowed to use this command.', 'flags': MessageFlags.Ephemeral });
  });

/**
 * Restricts the command to specific guild IDs.
 */
export const allowGuilds = (...guildIds: string[]) =>
  new GuardBuilder().run(async (interaction, next) => {
    if (interaction.guildId !== null && guildIds.includes(interaction.guildId) === true) return next();

    await interaction.reply({
      'content': 'This command is not available in this server.',
      'flags': MessageFlags.Ephemeral,
    });
  });

/**
 * Restricts the command to users with specific role IDs.
 */
export const requireRoles = (...roleIds: string[]) =>
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
      await interaction.reply({ 'content': 'Could not verify your roles.', 'flags': MessageFlags.Ephemeral });
      return;
    }

    const roles = member.roles;
    if (roles instanceof GuildMemberRoleManager === false) {
      await interaction.reply({ 'content': 'Could not verify your roles.', 'flags': MessageFlags.Ephemeral });
      return;
    }

    const hasRole = roleIds.some(roleId => roles.cache.has(roleId) === true);
    if (hasRole === true) return next();

    await interaction.reply({
      'content': 'You do not have the required role to use this command.',
      'flags': MessageFlags.Ephemeral,
    });
  });
