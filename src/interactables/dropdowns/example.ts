import { Interaction } from '@structures/Interaction';

/**
 * Example autocomplete handler demonstrating:
 * - Autocomplete response for slash command options
 * - Filtering choices based on user input
 *
 * Usage: Add autocomplete: true to a slash command option
 */
export const ExampleAutocomplete = new Interaction({
  'type': 'autocomplete',
  'customId': 'example_autocomplete',
}).run(async interaction => {
  const focusedValue = interaction.options.getFocused().toLowerCase();

  const choices = [
    { 'name': 'Apple', 'value': 'apple' },
    { 'name': 'Banana', 'value': 'banana' },
    { 'name': 'Cherry', 'value': 'cherry' },
    { 'name': 'Date', 'value': 'date' },
    { 'name': 'Elderberry', 'value': 'elderberry' },
  ];

  const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue)).slice(0, 25);

  await interaction.respond(filtered);
});

/**
 * Example using regex to match multiple autocomplete handlers
 * Matches: search_users, search_items, search_guilds, etc.
 */
export const SearchAutocomplete = new Interaction({
  'type': 'autocomplete',
  'customId': /^search_(.+)$/,
}).run(async interaction => {
  const focusedValue = interaction.options.getFocused().toLowerCase();
  const match = interaction.commandName.match(/^search_(.+)$/);
  const searchType = match?.[1] ?? 'items';

  const results = [
    { 'name': `${searchType}: Result 1 for "${focusedValue}"`, 'value': `${searchType}_1` },
    { 'name': `${searchType}: Result 2 for "${focusedValue}"`, 'value': `${searchType}_2` },
    { 'name': `${searchType}: Result 3 for "${focusedValue}"`, 'value': `${searchType}_3` },
  ];

  await interaction.respond(results.slice(0, 25));
});
