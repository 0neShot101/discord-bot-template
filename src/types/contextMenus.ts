import type { CommandGuard } from '@typings/guards';
import type {
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js';

export type ContextMenuInteraction<T extends ContextMenuCommandBuilder> =
  ReturnType<T['setType']> extends { type: 2 }
    ? UserContextMenuCommandInteraction
    : MessageContextMenuCommandInteraction;

export type ContextMenuEvents<T extends ContextMenuCommandBuilder> = {
  run: (interaction: ContextMenuInteraction<T>) => void;
  error: (error: Error, interaction: ContextMenuInteraction<T>) => void;
  [key: string]: (...args: never[]) => void;
};

export interface ContextMenuConfig {
  builder: (builder: ContextMenuCommandBuilder) => ContextMenuCommandBuilder;
  guards?: CommandGuard | CommandGuard[];
}
