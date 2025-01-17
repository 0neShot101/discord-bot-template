import Client from '..';

import logger from '../util/logger';

import registerSlashCommands from '../util/discord/registerSlashCommands';

/**
 * Event handler that runs when the client is ready.
 */
export default {
  /**
   * Specifies whether this event should be executed only once.
   * @type {boolean}
  **/
  'once': true,

  /**
   * The function to run when the event is triggered.
   * Handles the processing when the client is ready.
   * 
   * @async
   * @returns {Promise<void>} A promise that resolves when the client is ready.
  **/
  'run': async () => {
    await registerSlashCommands();
    
    logger.info(`[DiscordJS] (${Client.user?.tag}): Status -> Online`);
  },
};
