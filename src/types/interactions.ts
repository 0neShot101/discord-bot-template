import type { Interaction } from '@structures/Interaction';
import type {
  AnySelectMenuInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  Collection,
  MentionableSelectMenuInteraction,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserContextMenuCommandInteraction,
  UserSelectMenuInteraction,
} from 'discord.js';

export type InteractionType =
  | 'button'
  | 'stringSelect'
  | 'userSelect'
  | 'roleSelect'
  | 'mentionableSelect'
  | 'channelSelect'
  | 'selectMenu'
  | 'modal'
  | 'autocomplete'
  | 'userContextMenu'
  | 'messageContextMenu';

export type InteractionTypeMap = {
  button: ButtonInteraction;
  stringSelect: StringSelectMenuInteraction;
  userSelect: UserSelectMenuInteraction;
  roleSelect: RoleSelectMenuInteraction;
  mentionableSelect: MentionableSelectMenuInteraction;
  channelSelect: ChannelSelectMenuInteraction;
  selectMenu: AnySelectMenuInteraction;
  modal: ModalSubmitInteraction;
  autocomplete: AutocompleteInteraction;
  userContextMenu: UserContextMenuCommandInteraction;
  messageContextMenu: MessageContextMenuCommandInteraction;
};

export type InteractionFromType<T extends InteractionType> = InteractionTypeMap[T];

export type InteractionEvents<T extends InteractionType> = {
  run: (interaction: InteractionFromType<T>) => void;
  error: (error: Error, interaction: InteractionFromType<T>) => void;
  [key: string]: (...args: never[]) => void;
};

export type InteractionCollection = Collection<string, Interaction<InteractionType>>;

export type InteractionMatchType = 'exact' | 'startsWith' | 'regex' | 'custom';

export type InteractionMatcher<T extends InteractionType> =
  | string
  | RegExp
  | ((interaction: InteractionFromType<T>) => boolean);

export interface InteractionConfig<T extends InteractionType> {
  type: T;
  customId: InteractionMatcher<T>;
  guards?: InteractionGuard<T> | InteractionGuard<T>[];
}

export type GuardResult = { success: true } | { success: false };

export type InteractionGuard<T extends InteractionType> =
  | ((interaction: InteractionFromType<T>) => Promise<GuardResult> | GuardResult)
  | { execute: (interaction: InteractionFromType<T>) => Promise<GuardResult> | GuardResult };
