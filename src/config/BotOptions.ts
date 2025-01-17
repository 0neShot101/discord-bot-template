import {
  Partials,
  GatewayIntentBits,
} from 'discord.js';

const partials = [ 
  Partials.Channel, 
  Partials.GuildMember, 
  Partials.GuildScheduledEvent, 
  Partials.Message, 
  Partials.Reaction, 
  Partials.ThreadMember, 
  Partials.User,
];

const intents = 
  Object.keys(GatewayIntentBits)
    .filter(key => isNaN(parseInt(key)) === false)
    .map(key => parseInt(key));

/**
 * Configuration options for a Discord bot, including partials and gateway intents.
 */
export default {
  /**
   * An array of partial structures to enable partial data for certain events.
   */
  partials,

  /**
   * A list of gateway intents the bot will subscribe to.
   */
  intents,
};
