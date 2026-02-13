import { loadCommands } from '@handlers/commands';
import { Client } from '@structures/Client';
import { diff, fetchRemote, serialize } from '@utils/commandRegistry';
import { logger } from '@utils/logger';

import type { DeployScope } from '@typings/registry';

interface Flags {
  scope?: DeployScope;
}

export const run = async (flags: Flags): Promise<void> => {
  const client = new Client();
  await loadCommands(client);

  const local = serialize(client.commands);
  const remote = await fetchRemote(flags.scope);
  const result = diff(local, remote);

  if (result.added.length > 0) logger.info({ 'commands': result.added }, 'New (will be added)');

  if (result.removed.length > 0) logger.info({ 'commands': result.removed }, 'Stale (will be removed)');

  if (result.modified.length > 0) logger.info({ 'commands': result.modified }, 'Modified (will be updated)');

  if (result.unchanged.length > 0) logger.info({ 'commands': result.unchanged }, 'Unchanged');

  const changes = result.added.length + result.removed.length + result.modified.length;

  if (changes === 0) logger.info('Local and remote commands are in sync.');
  else logger.info(`${changes} change(s) detected.`);
};
