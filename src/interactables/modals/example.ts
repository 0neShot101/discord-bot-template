import { Interaction } from '@structures/Interaction';
import { MessageFlags } from 'discord.js';

/**
 * Example modal handler demonstrating:
 * - Modal submission handling
 * - Extracting field values from modal
 *
 * Usage: Show modal with customId 'example_modal' and fields 'title', 'description'
 */
export const ExampleModal = new Interaction({
  'type': 'modal',
  'customId': 'example_modal',
}).run(async interaction => {
  const title = interaction.fields.getTextInputValue('title');
  const description = interaction.fields.getTextInputValue('description');

  await interaction.reply({
    'content': `**Submitted:**\n> **Title:** ${title}\n> **Description:** ${description}`,
    'flags': MessageFlags.Ephemeral,
  });
});

/**
 * Example using function matching for complex customId logic
 */
export const FeedbackModal = new Interaction({
  'type': 'modal',
  'customId': interaction => interaction.customId.startsWith('feedback_'),
}).run(async interaction => {
  const feedback = interaction.fields.getTextInputValue('feedback');
  const category = interaction.customId.replace('feedback_', '');

  await interaction.reply({
    'content': `**Feedback received for ${category}:**\n${feedback}`,
    'flags': MessageFlags.Ephemeral,
  });
});
