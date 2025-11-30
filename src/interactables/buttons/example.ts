import { Interaction } from '@structures/Interaction';
import { MessageFlags } from 'discord.js';

/**
 * Example button handler demonstrating:
 * - String matching for customId
 * - Button interaction response
 *
 * Usage: Create a button with customId 'example_button'
 * @see src/structures/Interaction.ts for interaction structure
 */
export const ExampleButton = new Interaction({
  'type': 'button',
  'customId': 'example_button',
}).run(async interaction => {
  await interaction.reply({
    'content': 'Button clicked!',
    'flags': MessageFlags.Ephemeral,
  });
});

/**
 * Example using regex matching for dynamic customIds
 * Matches: confirm_123, confirm_abc, confirm_user_456, etc.
 */
export const ConfirmButton = new Interaction({
  'type': 'button',
  'customId': /^confirm_(.+)$/,
}).run(async interaction => {
  const match = interaction.customId.match(/^confirm_(.+)$/);
  const id = match?.[1] ?? 'unknown';

  await interaction.reply({
    'content': `Confirmed action for: ${id}`,
    'flags': MessageFlags.Ephemeral,
  });
});
