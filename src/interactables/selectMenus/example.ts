import { Interaction } from '@structures/Interaction';
import { MessageFlags } from 'discord.js';

/**
 * Example string select menu handler demonstrating:
 * - String select menu handling
 * - Accessing selected values
 *
 * Usage: Create a StringSelectMenu with customId 'example_select'
 */
export const ExampleSelectMenu = new Interaction({
  'type': 'stringSelect',
  'customId': 'example_select',
}).run(async interaction => {
  const selected = interaction.values.join(', ');

  await interaction.reply({
    'content': `You selected: ${selected}`,
    'flags': MessageFlags.Ephemeral,
  });
});

/**
 * Example user select menu handler
 */
export const UserSelectMenu = new Interaction({
  'type': 'userSelect',
  'customId': 'user_select',
}).run(async interaction => {
  const users = interaction.users.map(u => u.username).join(', ');

  await interaction.reply({
    'content': `Selected users: ${users}`,
    'flags': MessageFlags.Ephemeral,
  });
});

/**
 * Example role select menu handler
 */
export const RoleSelectMenu = new Interaction({
  'type': 'roleSelect',
  'customId': 'role_select',
}).run(async interaction => {
  const roles = interaction.roles.map(r => r.name).join(', ');

  await interaction.reply({
    'content': `Selected roles: ${roles}`,
    'flags': MessageFlags.Ephemeral,
  });
});

/**
 * Example channel select menu handler
 */
export const ChannelSelectMenu = new Interaction({
  'type': 'channelSelect',
  'customId': 'channel_select',
}).run(async interaction => {
  const channels = interaction.channels.map(c => ('name' in c ? c.name : c.id)).join(', ');

  await interaction.reply({
    'content': `Selected channels: ${channels}`,
    'flags': MessageFlags.Ephemeral,
  });
});
