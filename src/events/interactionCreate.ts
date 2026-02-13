import { client } from '@src/client';
import { Command } from '@structures/Command';
import { ContextMenuCommand } from '@structures/ContextMenuCommand';
import { Event } from '@structures/Event';
import { Events, Interaction } from 'discord.js';

import type { InteractionType } from '@typings/interactions';

type InteractionTypeCheck = [check: (i: Interaction) => boolean, type: InteractionType | 'command' | 'contextMenu'];

const interactionChecks: InteractionTypeCheck[] = [
  [i => i.isChatInputCommand(), 'command'],
  [i => i.isUserContextMenuCommand(), 'contextMenu'],
  [i => i.isMessageContextMenuCommand(), 'contextMenu'],
  [i => i.isButton(), 'button'],
  [i => i.isStringSelectMenu(), 'stringSelect'],
  [i => i.isUserSelectMenu(), 'userSelect'],
  [i => i.isRoleSelectMenu(), 'roleSelect'],
  [i => i.isMentionableSelectMenu(), 'mentionableSelect'],
  [i => i.isChannelSelectMenu(), 'channelSelect'],
  [i => i.isAnySelectMenu(), 'selectMenu'],
  [i => i.isModalSubmit(), 'modal'],
  [i => i.isAutocomplete(), 'autocomplete'],
];

const getInteractionType = (interaction: Interaction): InteractionType | 'command' | 'contextMenu' | null => {
  for (const [check, type] of interactionChecks) if (check(interaction) === true) return type;

  return null;
};

export default new Event(Events.InteractionCreate).run(async interaction => {
  const type = getInteractionType(interaction);
  if (type === null) return;

  if (type === 'command' && interaction.isChatInputCommand() === true) {
    const command = client.commands.get(interaction.commandName);
    if (command !== undefined && command instanceof Command) command.emit('run', interaction);
    return;
  }

  if (type === 'contextMenu' && interaction.isContextMenuCommand() === true) {
    const command = client.commands.get(interaction.commandName);
    if (command !== undefined && command instanceof ContextMenuCommand) command.emit('run', interaction as never);
    return;
  }

  const handler = client.interactions.find(h => h.type === type && h.matches(interaction as never) === true);
  if (handler !== undefined) handler.emit('run', interaction as never);
});
