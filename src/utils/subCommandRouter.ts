import type { SubcommandConfig } from '@typings/commands';
import type { CommandGuard } from '@typings/guards';
import type { ChatInputCommandInteraction } from 'discord.js';

export interface ParsedSubcommandConfig {
  handler: (interaction: ChatInputCommandInteraction) => unknown;
  guards: CommandGuard[];
}

type SubcommandMap = Map<string, ParsedSubcommandConfig | Map<string, ParsedSubcommandConfig>>;

const normalize = (g?: CommandGuard | CommandGuard[]) => (Array.isArray(g) ? g : g ? [g] : []);

export const parseSubcommands = (
  subcommands?: Record<string, SubcommandConfig | Record<string, SubcommandConfig>>,
): SubcommandMap => {
  const map = new Map();
  if (subcommands === undefined) return map;

  for (const [key, config] of Object.entries(subcommands)) {
    if ('handler' in config && typeof config.handler === 'function') {
      const subConfig = config as SubcommandConfig;
      map.set(key, { 'handler': subConfig.handler, 'guards': normalize(subConfig.guards) });
      continue;
    }
    const group = new Map();
    for (const [subKey, subConfig] of Object.entries(config as Record<string, SubcommandConfig>))
      group.set(subKey, { 'handler': subConfig.handler, 'guards': normalize(subConfig.guards) });

    map.set(key, group);
  }
  return map;
};

export const executeGuards = async (guards: CommandGuard[], i: ChatInputCommandInteraction) => {
  for (const guard of guards) {
    const fn = typeof guard === 'function' ? guard : guard.execute?.bind(guard);
    if (fn && (await fn(i)).success === false) return false;
  }
  return true;
};

export const routeSubcommand = async (i: ChatInputCommandInteraction, map: SubcommandMap): Promise<boolean> => {
  const [group, name] = [i.options.getSubcommandGroup(false), i.options.getSubcommand(false)];
  if (name === null) return false;

  const root = map.get(group ?? name);
  const config = group && root instanceof Map ? root.get(name) : !group && !(root instanceof Map) ? root : undefined;

  if (config === undefined) return false;
  if ((await executeGuards(config.guards, i)) === false) return true;

  await config.handler(i);
  return true;
};
