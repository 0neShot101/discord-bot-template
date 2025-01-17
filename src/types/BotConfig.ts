/**
 * Defines the configuration settings for a Discord bot.
 */
export default interface BotConfig {
  /**
   * The path to the directory containing event files.
   */
  'eventsDirectory': string;

  /**
   * The path to the directory containing command files.
   */
  'commandsDirectory': string;

  /**
   * The command prefix.
   */
  'prefix': string;

  /**
   * An array of user IDs representing bot owners.
   */
  'owners': string[];

  /**
   * Indicates whether debug mode is active.
   */
  'debug'?: boolean;

  /**
   * The name of the bot.
   */
  'name': string;
}