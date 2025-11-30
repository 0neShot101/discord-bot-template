import { join } from 'path';

import { Client } from '@structures/Client';
import { Interaction } from '@structures/Interaction';
import { logger } from '@utils/logger';
import { walkDirectory } from '@utils/walkDirectory';

import type { InteractionType } from '@typings/interactions';

export const loadInteractions = async (client: Client) => {
  const interactablesPath = join(process.cwd(), 'src', 'interactables');
  const interactionFolders = ['buttons', 'modals', 'selectMenus', 'dropdowns'];

  const allFiles: string[] = [];
  for (const folder of interactionFolders) {
    const folderPath = join(interactablesPath, folder);
    try {
      const files = await walkDirectory(folderPath);
      allFiles.push(...files);
    } catch {
      // Folder doesn't exist or is empty, skip
    }
  }

  const files = allFiles;

  const results = await Promise.all(
    files
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .map(async file => {
        try {
          const module = await import(file);
          const interactions = Object.values(module).filter(
            (x): x is Interaction<InteractionType> => x instanceof Interaction,
          );

          for (const interaction of interactions) client.interactions.push(interaction);

          return interactions.length;
        } catch (error) {
          logger.error({ file, error }, '🔴 Failed to load interaction file');
          return 0;
        }
      }),
  );

  const count = results.reduce((a, b) => a + b, 0);
  logger.info(`🟢 Loaded ${count} interactions`);
};
