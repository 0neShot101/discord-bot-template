import type { CommandCollection } from '@typings/commands';
import type {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';

export type DeployScope = 'guild' | 'global';

export type CommandJSON =
  | RESTPostAPIChatInputApplicationCommandsJSONBody
  | RESTPostAPIContextMenuApplicationCommandsJSONBody;

export interface DeployOptions {
  commands: CommandCollection;
  scope?: DeployScope | undefined;
  force?: boolean | undefined;
}

export interface DeployResult {
  deployed: boolean;
  count: number;
  scope: DeployScope;
  reason: 'changed' | 'forced' | 'skipped' | 'error';
}

export interface CommandDiff {
  local: CommandJSON[];
  remote: CommandJSON[];
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}
