import { join } from 'path';

import { Client } from '@structures/Client';
import { Command } from '@structures/Command';
import { ContextMenuCommand } from '@structures/ContextMenuCommand';
import { logger } from '@utils/logger';
import { walkDirectory } from '@utils/walkDirectory';

export const loadCommands = async (client: Client) => {
  const commandsPath = join(process.cwd(), 'src', 'interactables', 'commands');
  const files = await walkDirectory(commandsPath);

  const results = await Promise.all(
    files
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
          logger.error({ file, error }, '🔴 Failed to load command file');
          return 0;
        }
      }),
  );

  const count = results.reduce((a, b) => a + b, 0);
  logger.info(`🟢 Loaded ${count} commands`);
};
