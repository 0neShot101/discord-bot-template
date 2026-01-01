import { EventEmitter } from '@3xpo/events';
import { logger } from '@utils/logger';

import type {
  GuardResult,
  InteractionConfig,
  InteractionEvents,
  InteractionFromType,
  InteractionGuard,
  InteractionMatcher,
  InteractionType,
} from '@typings/interactions';

export class Interaction<T extends InteractionType> extends EventEmitter<InteractionEvents<T>> {
  public readonly type: T;
  public readonly customId: InteractionMatcher<T>;
  private readonly guards: InteractionGuard<T>[] = [];

  private getInteractionIdentifier = (interaction: InteractionFromType<T>): string | null => {
    if ('customId' in interaction && typeof interaction.customId === 'string') return interaction.customId;
    if ('commandName' in interaction && typeof interaction.commandName === 'string') return interaction.commandName;

    return null;
  };

  /**
   * Creates a new Interaction handler.
   * @param config - The interaction configuration with type, customId matcher, and optional guards.
   */
  constructor(config: InteractionConfig<T>) {
    super();
    this.type = config.type;
    this.customId = config.customId;

    if (config.guards !== undefined) this.guards = Array.isArray(config.guards) ? config.guards : [config.guards];
  }

  /**
   * Checks if this interaction handler matches the given customId.
   */
  public matches = (interaction: InteractionFromType<T>): boolean => {
    const identifier = this.getInteractionIdentifier(interaction);
    if (identifier === null) return false;

    if (typeof this.customId === 'string') return identifier === this.customId;
    if (this.customId instanceof RegExp) return this.customId.test(identifier);
    if (typeof this.customId === 'function') return this.customId(interaction);

    return false;
  };

  /**
   * Executes all guards for this interaction.
   */
  private executeGuards = async (interaction: InteractionFromType<T>): Promise<boolean> => {
    for (const guard of this.guards) {
      const fn = typeof guard === 'function' ? guard : guard.execute?.bind(guard);
      if (fn === undefined) continue;

      const result: GuardResult = await fn(interaction);
      if (result.success === false) return false;
    }
    return true;
  };

  /**
   * Registers the main handler for this interaction.
   * @param handler - The function to run when the interaction is triggered.
   */
  public run = (handler: (interaction: InteractionFromType<T>) => Promise<void> | void): this => {
    this.on('run', async interaction => {
      try {
        const guardsPass = await this.executeGuards(interaction);
        if (guardsPass === false) return;

        await handler(interaction);
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));

        if (this.listenerCount('error') > 0) return this.emit('error', normalizedError, interaction);

        logger.error(normalizedError, `Error executing interaction handler`);

        if ('replied' in interaction && 'deferred' in interaction) {
          const errorResponse = { 'content': `An error occurred: \`${normalizedError.message}\``, 'ephemeral': true };

          if (interaction.replied === true || interaction.deferred === true)
            return await interaction.followUp(errorResponse).catch(() => {});

          await interaction.reply(errorResponse).catch(() => {});
        }
      }
    });
    return this;
  };

  /**
   * Registers a custom error handler for this interaction.
   * @param handler - The function to run when an error occurs during execution.
   */
  public onError = (handler: (error: Error, interaction: InteractionFromType<T>) => Promise<void> | void): this => {
    this.on('error', (error, interaction) =>
      Promise.resolve(handler(error, interaction)).catch(error =>
        logger.error(error, 'There was an error inside the error handler!'),
      ),
    );
    return this;
  };
}
