import { client } from '@src/index';
import { Command } from '@structures/Command';
import { EmbedBuilder, MessageFlags } from 'discord.js';

/**
 * Help command that auto-generates documentation from registered commands.
 * Shows all available commands or details about a specific command.
 */
export const HelpCommand = new Command({
  'builder': builder =>
    builder
      .setName('help')
      .setDescription('View all available commands or get help for a specific command')
      .addStringOption(option =>
        option.setName('command').setDescription('Get detailed help for a specific command').setRequired(false),
      ),
}).run(async interaction => {
  const commandName = interaction.options.getString('command');
  const slashCommands = client.commands.filter((cmd): cmd is Command => cmd instanceof Command);

  if (commandName !== null) {
    const command = slashCommands.get(commandName);

    if (command === undefined) {
      await interaction.reply({
        'content': `❌ Command \`${commandName}\` not found.`,
        'flags': MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`/${command.data.name}`)
      .setDescription(command.data.description)
      .setColor('Blurple');

    const options = command.data.options;
    if (options !== undefined && options.length > 0) {
      const optionsList = options
        .map(opt => {
          const json = opt.toJSON();
          const required = 'required' in json && json.required === true ? ' *(required)*' : '';
          return `• **${json.name}**${required}: ${json.description}`;
        })
        .join('\n');

      embed.addFields({ 'name': 'Options', 'value': optionsList });
    }

    await interaction.reply({ 'embeds': [embed], 'flags': MessageFlags.Ephemeral });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('Available Commands')
    .setDescription('Use `/help <command>` for detailed information about a specific command.')
    .setColor('Blurple');

  const commandList = slashCommands
    .filter(cmd => cmd.data.name !== 'help')
    .map(cmd => `**/${cmd.data.name}** - ${cmd.data.description}`)
    .join('\n');

  if (commandList.length > 0) embed.addFields({ 'name': 'Commands', 'value': commandList });
  else embed.addFields({ 'name': 'Commands', 'value': '*No commands registered yet.*' });

  await interaction.reply({ 'embeds': [embed], 'flags': MessageFlags.Ephemeral });
});
