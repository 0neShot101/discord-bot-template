import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { DISCORD_CLIENT_ID, DISCORD_DEVELOPMENT_GUILD_ID, DISCORD_TOKEN, NODE_ENV } from '@utils/environment';
import { logger } from '@utils/logger';
import { REST, Routes } from 'discord.js';

import type { CommandCollection } from '@typings/commands';
import type { CommandDiff, CommandJSON, DeployOptions, DeployResult, DeployScope } from '@typings/registry';

const CACHE_DIR = join(process.cwd(), '.cache');
const HASH_FILE = join(CACHE_DIR, 'commands.hash');

const rest = new REST({ 'version': '10' }).setToken(DISCORD_TOKEN);

const resolveScope = (override?: DeployScope): DeployScope => {
  if (override !== undefined) return override;
  return NODE_ENV === 'production' ? 'global' : 'guild';
};

const getRoute = (scope: DeployScope) =>
  scope === 'guild'
    ? Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_DEVELOPMENT_GUILD_ID)
    : Routes.applicationCommands(DISCORD_CLIENT_ID);

export const serialize = (commands: CommandCollection): CommandJSON[] =>
  commands.map(cmd => cmd.data.toJSON() as CommandJSON).sort((a, b) => a.name.localeCompare(b.name));

const hash = (commands: CommandJSON[]): string => {
  const hasher = new Bun.CryptoHasher('sha256');
  hasher.update(JSON.stringify(commands));
  return hasher.digest('hex');
};

const readHash = async (): Promise<string | undefined> => {
  try {
    return await readFile(HASH_FILE, 'utf-8');
  } catch {
    return undefined;
  }
};

const writeHash = async (value: string): Promise<void> => {
  await mkdir(CACHE_DIR, { 'recursive': true });
  await writeFile(HASH_FILE, value, 'utf-8');
};

const hasChanged = async (current: string): Promise<boolean> => {
  const cached = await readHash();
  if (cached === undefined) return true;
  return cached !== current;
};

export const deploy = async (options: DeployOptions): Promise<DeployResult> => {
  const scope = resolveScope(options.scope);
  const serialized = serialize(options.commands);
  const checksum = hash(serialized);
  const route = getRoute(scope);

  if (options.force !== true) {
    const changed = await hasChanged(checksum);
    if (changed === false) return { 'deployed': false, 'count': serialized.length, scope, 'reason': 'skipped' };
  }

  try {
    await rest.put(route, { 'body': serialized });
    await writeHash(checksum);

    const label = scope === 'guild' ? `to guild ${DISCORD_DEVELOPMENT_GUILD_ID}` : 'globally';
    logger.info(`Registered ${serialized.length} command(s) ${label}`);

    return {
      'deployed': true,
      'count': serialized.length,
      scope,
      'reason': options.force === true ? 'forced' : 'changed',
    };
  } catch (error) {
    logger.error({ error }, 'Failed to register commands');
    return { 'deployed': false, 'count': 0, scope, 'reason': 'error' };
  }
};

export const clear = async (scope?: DeployScope): Promise<void> => {
  const resolved = resolveScope(scope);
  const route = getRoute(resolved);

  try {
    await rest.put(route, { 'body': [] });
    await writeHash('');

    const label = resolved === 'guild' ? `from guild ${DISCORD_DEVELOPMENT_GUILD_ID}` : 'globally';
    logger.info(`Cleared all commands ${label}`);
  } catch (error) {
    logger.error({ error }, 'Failed to clear commands');
  }
};

const isCommandArray = (data: unknown): data is CommandJSON[] =>
  Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null && 'name' in item);

export const fetchRemote = async (scope?: DeployScope): Promise<CommandJSON[]> => {
  const resolved = resolveScope(scope);
  const route = getRoute(resolved);
  const response = await rest.get(route);

  if (isCommandArray(response) === false) return [];
  return response;
};

export const diff = (local: CommandJSON[], remote: CommandJSON[]): CommandDiff => {
  const localNames = new Set(local.map(c => c.name));
  const remoteNames = new Set(remote.map(c => c.name));
  const remoteByName = new Map(remote.map(c => [c.name, c]));

  const added = local.filter(c => remoteNames.has(c.name) === false).map(c => c.name);
  const removed = remote.filter(c => localNames.has(c.name) === false).map(c => c.name);

  const modified: string[] = [];
  const unchanged: string[] = [];

  for (const cmd of local) {
    const existing = remoteByName.get(cmd.name);
    if (existing === undefined) continue;

    if (JSON.stringify(cmd) === JSON.stringify(existing)) unchanged.push(cmd.name);
    else modified.push(cmd.name);
  }

  return { local, remote, added, removed, modified, unchanged };
};
