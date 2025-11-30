import { Command } from '@structures/Command';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  LabelBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from 'discord.js';

/**
 * Example command showcasing all interactable types:
 * - Buttons (example_button)
 * - Modals (example_modal)
 * - String Select Menu (example_select)
 * - User Select Menu (user_select)
 * - Role Select Menu (role_select)
 * - Channel Select Menu (channel_select)
 *
 */
export const ExampleCommand = new Command({
  'builder': builder =>
    builder
      .setName('example')
      .setDescription('Showcase all interactable examples')
      .addSubcommand(sub => sub.setName('button').setDescription('Show example buttons'))
      .addSubcommand(sub => sub.setName('modal').setDescription('Show example modal'))
      .addSubcommand(sub => sub.setName('select').setDescription('Show example string select menu'))
      .addSubcommand(sub => sub.setName('user-select').setDescription('Show example user select menu'))
      .addSubcommand(sub => sub.setName('role-select').setDescription('Show example role select menu'))
      .addSubcommand(sub => sub.setName('channel-select').setDescription('Show example channel select menu')),
  'subcommands': {
    'button': {
      'handler': async interaction => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('example_button').setLabel('Click Me!').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('confirm_123').setLabel('Confirm (Regex)').setStyle(ButtonStyle.Success),
        );

        await interaction.reply({
          'content': '**Button Examples**\nClick the buttons below to test the handlers.',
          'components': [row],
        });
      },
    },
    'modal': {
      'handler': async interaction => {
        const modal = new ModalBuilder().setCustomId('example_modal').setTitle('Example Modal');

        modal.addLabelComponents(
          new LabelBuilder()
            .setLabel('Title')
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId('title')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter a title')
                .setRequired(true),
            ),
          new LabelBuilder()
            .setLabel('Description')
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId('description')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Enter a description')
                .setRequired(true),
            ),
        );

        await interaction.showModal(modal);
      },
    },
    'select': {
      'handler': async interaction => {
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('example_select')
            .setPlaceholder('Select an option')
            .setMinValues(1)
            .setMaxValues(3)
            .addOptions(
              { 'label': 'Option 1', 'value': 'option_1', 'description': 'First option' },
              { 'label': 'Option 2', 'value': 'option_2', 'description': 'Second option' },
              { 'label': 'Option 3', 'value': 'option_3', 'description': 'Third option' },
            ),
        );

        await interaction.reply({
          'content': '**String Select Menu Example**\nSelect one or more options below.',
          'components': [row],
        });
      },
    },
    'user-select': {
      'handler': async interaction => {
        const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
          new UserSelectMenuBuilder()
            .setCustomId('user_select')
            .setPlaceholder('Select users')
            .setMinValues(1)
            .setMaxValues(5),
        );

        await interaction.reply({
          'content': '**User Select Menu Example**\nSelect one or more users below.',
          'components': [row],
        });
      },
    },
    'role-select': {
      'handler': async interaction => {
        const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
          new RoleSelectMenuBuilder()
            .setCustomId('role_select')
            .setPlaceholder('Select roles')
            .setMinValues(1)
            .setMaxValues(5),
        );

        await interaction.reply({
          'content': '**Role Select Menu Example**\nSelect one or more roles below.',
          'components': [row],
        });
      },
    },
    'channel-select': {
      'handler': async interaction => {
        const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId('channel_select')
            .setPlaceholder('Select channels')
            .setMinValues(1)
            .setMaxValues(5),
        );

        await interaction.reply({
          'content': '**Channel Select Menu Example**\nSelect one or more channels below.',
          'components': [row],
        });
      },
    },
  },
}).run();
