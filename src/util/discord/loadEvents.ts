import path from 'path';

import type Event from '../../types/Event';

import logger from '../logger';
import getAllFilePaths from '../getAllFilePaths';

/**
 * Asynchronously loads events for the Client.
 * This function scans the specified directory for event files and dynamically imports them.
 * Each event is then registered with the  client.
 *
 * @param {typeof Client} Client - The instance of the Client to which events are loaded.
 * @async
 * @returns {Promise<void>} A promise that resolves when all events are loaded.
 */
export default async(
  Client: typeof import('../..').default,
): Promise<void> => {
  const eventFolder = Client.config.eventsDirectory || path.resolve('src', 'events');
  const eventFiles = await getAllFilePaths(eventFolder);

  const importedEvents = await Promise.all(
    eventFiles.map(async eventFile => {
      const { 'default': event, } = await import(eventFile) as { 'default': Event, };

      /*
        Use the filename (sans extension) as the event name; 
        or fall back to `event.name` if that exists.
      */
      const eventName = path.parse(eventFile).name;
      const once = Boolean(event.once);

      return { eventName, event, once, };
    }),
  );

  for (const { eventName, event, once, } of importedEvents) {
    logger.info(`[${Client.config.name}] (Event): Loaded -> ${eventName}`);
  
    Client[once ? 'once' : 'on'](eventName, event.run);
  };

  console.log('\n');
};
