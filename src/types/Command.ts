import type CommandInteraction from './CommandInteraction';

/**
 * Represents an event mapping for Command.
 */
export interface CommandEvent {
  /**
   * Triggered when the command is run.
   * @param interaction The interaction object
   */
  'run': (interaction: CommandInteraction) => void;
};

/**
 * Defines methods to listen for and emit command events.
 */
export interface Command {
  /**
   * Registers a listener for a specific command event.
   * @param event The event name
   * @param listener The function to execute when the event is triggered
   * @returns This command instance
   */
  on<E extends keyof CommandEvent>(
    event: E,
    listener: CommandEvent[E],
  ): this;

  /**
   * Emits a specific command event.
   * @param event The event name
   * @param args Parameters for the event listener
   * @returns True if an event listener was called, false otherwise
   */
  emit<E extends keyof CommandEvent>(
    event: E,
    ...args: Parameters<CommandEvent[E]>
  ): boolean;
};
