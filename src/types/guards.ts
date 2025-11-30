import type { ChatInputCommandInteraction } from 'discord.js';

export type GuardResult = { success: true } | { success: false };

export type CommandGuard =
  | ((interaction: ChatInputCommandInteraction) => Promise<GuardResult> | GuardResult)
  | { execute: (interaction: ChatInputCommandInteraction) => Promise<GuardResult> | GuardResult };

export type GuardEvents = {
  run: (interaction: ChatInputCommandInteraction, next: () => void) => void;
  error: (error: Error, interaction: ChatInputCommandInteraction) => void;
  [key: string]: (...args: never[]) => void;
};

export interface GuardConfig {
  guards?: CommandGuard[];
}
