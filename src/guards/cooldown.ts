import { GuardBuilder } from '@structures/Guard';
import { MessageFlags } from 'discord.js';

type CooldownScope = 'user' | 'guild' | 'channel' | 'global';

const cooldowns = new Map<string, number>();

/**
 * Creates a cooldown guard with configurable scope.
 * @param seconds - Cooldown duration in seconds.
 * @param scope - The scope of the cooldown ('user' | 'guild' | 'channel' | 'global').
 */
export const cooldown = (seconds: number, scope: CooldownScope = 'user') =>
  new GuardBuilder().run(async (interaction, next) => {
    const commandName = interaction.commandName;
    let key: string;

    switch (scope) {
      case 'user':
        key = `${interaction.user.id}-${commandName}`;
        break;
      case 'guild':
        if (interaction.guildId === null) key = `dm-${interaction.user.id}-${commandName}`;
        else key = `guild-${interaction.guildId}-${commandName}`;

        break;
      case 'channel':
        key = `channel-${interaction.channelId}-${commandName}`;
        break;
      case 'global':
        key = `global-${commandName}`;
        break;
    }

    const now = Date.now();
    const cooldownEnd = cooldowns.get(key);

    if (cooldownEnd !== undefined && now < cooldownEnd) {
      const timeLeft = Math.ceil((cooldownEnd - now) / 1000);
      await interaction.reply({
        'content': `Please wait ${timeLeft}s before using this command again.`,
        'flags': MessageFlags.Ephemeral,
      });
      return;
    }

    cooldowns.set(key, now + seconds * 1000);

    setTimeout(() => cooldowns.delete(key), seconds * 1000);

    next();
  });

/**
 * Per-user cooldown (default behavior).
 */
export const userCooldown = (seconds: number) => cooldown(seconds, 'user');

/**
 * Per-guild cooldown (shared across all users in a guild).
 */
export const guildCooldown = (seconds: number) => cooldown(seconds, 'guild');

/**
 * Per-channel cooldown (shared across all users in a channel).
 */
export const channelCooldown = (seconds: number) => cooldown(seconds, 'channel');

/**
 * Global cooldown (shared across all users everywhere).
 */
export const globalCooldown = (seconds: number) => cooldown(seconds, 'global');
