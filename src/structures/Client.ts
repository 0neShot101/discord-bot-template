import {
  Client,
  Collection,

  type ClientOptions,
} from 'discord.js';

import type BotConfig from '../types/BotConfig';

import BotOptions from '../config/BotOptions';

import commandCache from '../util/discord/commandCache';
import loadEvents from '../util/discord/loadEvents';

import Command from './Command';


/**
 * Extends the Discord.js Client class to create a custom bot client.
 * 
 * @extends { Client } Inhert funcationality from the Discord.js Client class.
**/
export default class BotClient extends Client {
  public config: BotConfig;

  /**
   * Collection of commands available to the Client.
   * @type {Promise<Collection<string, Command>>}
  **/
  public Commands: Promise<Collection<string, Command>>;

  constructor(
    config: BotConfig,
    options?: ClientOptions,
  ) {
    super(options ?? BotOptions);

    this.config = config;
    this.Commands = commandCache(this.config.commandsDirectory);

    loadEvents(this);
  };
};
