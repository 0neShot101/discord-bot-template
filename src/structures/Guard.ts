import { EventEmitter } from '@3xpo/events';
import { logger } from '@utils/logger';

import type { CommandGuard, GuardConfig, GuardEvents, GuardResult } from '@typings/guards';
import type { ChatInputCommandInteraction } from 'discord.js';

export class GuardBuilder extends EventEmitter<GuardEvents> {
  private readonly guards: CommandGuard[] = [];
  private handler?: (interaction: ChatInputCommandInteraction, next: () => void) => Promise<void> | void;

  /**
   * Creates a new GuardBuilder instance.
   * @param config - The guard configuration with optional nested guards.
   */
  constructor(config: GuardConfig = {}) {
    super();
    if (config.guards !== undefined) this.guards = config.guards;
  }

  /**
   * Registers the execution handler for this guard.
   * @param handler - The function to run when the guard is checked.
   */
  public run = (
    handler: (interaction: ChatInputCommandInteraction, next: () => void) => Promise<void> | void,
  ): this => {
    this.handler = handler;
    return this;
  };

  /**
   * Registers a custom error handler for this guard.
   * @param handler - The function to run when an error occurs during execution.
   */
  public onError = (
    handler: (error: Error, interaction: ChatInputCommandInteraction) => Promise<void> | void,
  ): this => {
    this.on('error', (error, interaction) =>
      Promise.resolve(handler(error, interaction)).catch(error =>
        logger.error(error, 'There was an error inside the guard error handler!'),
      ),
    );
    return this;
  };

  /**
   * Executes this guard as a CommandGuard.
   * @param interaction - The command interaction to check.
   */
  public execute = async (interaction: ChatInputCommandInteraction): Promise<GuardResult> => {
    try {
      for (const guard of this.guards) {
        const guardFn = typeof guard === 'function' ? guard : guard.execute.bind(guard);
        const result = await guardFn(interaction);
        if (result.success === false) return result;
      }

      if (this.handler === undefined) return { 'success': true };

      const state = { 'shouldContinue': false };
      const next = (): void => {
        state.shouldContinue = true;
      };

      await this.handler(interaction, next);

      if (state.shouldContinue === true) return { 'success': true };

      return { 'success': false };
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));

      if (this.listenerCount('error') > 0) {
        this.emit('error', normalizedError, interaction);
        return { 'success': false };
      }

      logger.error(normalizedError, 'Error executing guard');
      return { 'success': false };
    }
  };

  /**
   * Make GuardBuilder callable as a CommandGuard function.
   */
  public call = (interaction: ChatInputCommandInteraction): Promise<GuardResult> => {
    return this.execute(interaction);
  };

  public [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `GuardBuilder { guards: ${this.guards.length} }`;
  }
}
