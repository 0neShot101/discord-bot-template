import { ClientEvents } from 'discord.js';

export class Event<Key extends keyof ClientEvents> {
  public execute: (...args: ClientEvents[Key]) => Promise<void> | void = () => {};

  constructor(
    public name: Key,
    public once: boolean = false,
  ) {}

  public run(fn: (...args: ClientEvents[Key]) => Promise<void> | void): this {
    this.execute = fn;
    return this;
  }
}
