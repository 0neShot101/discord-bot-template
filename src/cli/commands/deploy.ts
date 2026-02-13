import { loadCommands } from '@handlers/commands';
import { Client } from '@structures/Client';
import { deploy } from '@utils/commandRegistry';
import { logger } from '@utils/logger';

import type { DeployScope } from '@typings/registry';

interface Flags {
  scope?: DeployScope;
  force: boolean;
}

export const run = async (flags: Flags): Promise<void> => {
  const client = new Client();
  await loadCommands(client);

  const result = await deploy({
    'commands': client.commands,
    'scope': flags.scope,
    'force': flags.force,
  });

  if (result.reason === 'skipped') logger.info('No command changes detected. Use --force to deploy anyway.');

  if (result.reason === 'error') process.exit(1);
};
