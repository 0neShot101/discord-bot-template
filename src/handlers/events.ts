import { join } from 'path';

import { Client } from '@structures/Client';
import { Event } from '@structures/Event';
import { logger } from '@utils/logger';
import { walkDirectory } from '@utils/walkDirectory';

export const loadEvents = async (client: Client) => {
  const eventsPath = join(process.cwd(), 'src', 'events');
  const files = await walkDirectory(eventsPath);

  const results = await Promise.all(
    files
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .map(async file => {
        try {
          const module = await import(file);
          const events = Object.values(module).filter((x): x is Event<any> => x instanceof Event);

          for (const event of events)
            client[event.once === true ? 'once' : 'on'](event.name, (...args) => event.execute(...args));

          return events.length;
        } catch (error) {
          logger.error({ file, error }, '🔴 Failed to load event file');
          return 0;
        }
      }),
  );

  const count = results.reduce((a, b) => a + b, 0);
  logger.info(`🟢 Loaded ${count} events`);
};
