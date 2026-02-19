import { join } from 'path';

import { Client } from '@structures/Client';
import { Command } from '@structures/Command';
import { ContextMenuCommand } from '@structures/ContextMenuCommand';
import { logger } from '@utils/logger';
import { walkDirectory } from '@utils/walkDirectory';

export const loadCommands = async (client: Client) => {
  const base = join(process.cwd(), 'src', 'interactables');
  const dirs = [join(base, 'commands'), join(base, 'contextMenus')];

  const allFiles: string[] = [];
  for (const dir of dirs)
    try {
      const files = await walkDirectory(dir);
      allFiles.push(...files);
    } catch {
      logger.debug({ dir }, 'Directory not found, skipping');
    }

  const results = await Promise.all(
    allFiles
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .map(async file => {
        try {
          const module = await import(file);
          const commands = Object.values(module).filter(
            (x): x is Command | ContextMenuCommand => x instanceof Command || x instanceof ContextMenuCommand,
          );

          for (const command of commands) client.commands.set(command.data.name, command);

          return commands.length;
        } catch (error) {
          logger.error({ file, error }, 'Failed to load command file');
          return 0;
        }
      }),
  );

  const count = results.reduce((a, b) => a + b, 0);
  logger.info(`Loaded ${count} command(s)`);
};
