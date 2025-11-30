import { GuardBuilder } from '@structures/Guard';
import { MessageFlags } from 'discord.js';

export const guildOnly = new GuardBuilder().run(async (interaction, next) => {
  if (interaction.guild !== null) return next();

  await interaction.reply({ 'content': 'This command can only be used in servers.', 'flags': MessageFlags.Ephemeral });
});

export const dmOnly = new GuardBuilder().run(async (interaction, next) => {
  if (interaction.guild === null) return next();

  await interaction.reply({ 'content': 'This command can only be used in DMs.', 'flags': MessageFlags.Ephemeral });
});

export const nsfwOnly = new GuardBuilder().run(async (interaction, next) => {
  if (interaction.channel === null) {
    await interaction.reply({ 'content': 'Could not verify channel.', 'flags': MessageFlags.Ephemeral });
    return;
  }

  if (interaction.channel.isDMBased() === true || ('nsfw' in interaction.channel && interaction.channel.nsfw === true))
    return next();

  await interaction.reply({
    'content': 'This command can only be used in NSFW channels.',
    'flags': MessageFlags.Ephemeral,
  });
});
