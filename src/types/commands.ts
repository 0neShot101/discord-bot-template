import type { Command } from '@structures/Command';
import type { ContextMenuCommand } from '@structures/ContextMenuCommand';
import type { CommandGuard } from '@typings/guards';
import type {
  ChatInputCommandInteraction,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type CommandInteraction = ChatInputCommandInteraction;

export type CommandCollection = Collection<string, Command | ContextMenuCommand>;

export type CommandBuilder =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export type CommandEvents = {
  run: (interaction: ChatInputCommandInteraction) => void;
  error: (error: Error, interaction: ChatInputCommandInteraction) => void;
  [key: string]: (...args: never[]) => void;
};

export type SubcommandHandler = (interaction: ChatInputCommandInteraction) => unknown;

export interface SubcommandConfig {
  handler: SubcommandHandler;
  guards?: CommandGuard | CommandGuard[];
}

export interface CommandConfig {
  builder: (builder: SlashCommandBuilder) => CommandBuilder;
  guards?: CommandGuard | CommandGuard[];
  subcommands?: Record<string, SubcommandConfig | Record<string, SubcommandConfig>>;
}
