import {
  CommandInteractionOptionResolver,
  CommandInteraction as BaseCommandInteraction,
} from 'discord.js';

/**
 * Represents an extended command interaction that provides additional features
 * for resolving command options.
 */
export default interface CommandInteraction extends BaseCommandInteraction {
  /**
   * Provides a convenient way to access and resolve the command's options.
   */
  'options': CommandInteractionOptionResolver;
};
