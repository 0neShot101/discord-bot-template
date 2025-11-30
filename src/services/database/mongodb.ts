import { MONGODB_DB_NAME, MONGODB_URI } from '@utils/environment';
import { logger } from '@utils/logger';
import { CommandStartedEvent, CommandSucceededEvent, MongoClient } from 'mongodb';

const OPERATION_EMOJIS = {
  'find': '🔍',
  'insert': '📋',
  'update': '✏️',
  'delete': '🗑️',
  'aggregate': '🔄',
  'count': '🔢',
  'drop': '💥',
  'create': '🏗️',
} as const;

type OperationType = keyof typeof OPERATION_EMOJIS;

const client = new MongoClient(MONGODB_URI as string, { 'monitorCommands': true });

const hasNamespace = (reply: unknown): reply is { ns: string } =>
  typeof reply === 'object' && reply !== null && 'ns' in reply && typeof reply.ns === 'string';

const hasDocCount = (reply: unknown): reply is { n: number } =>
  typeof reply === 'object' && reply !== null && 'n' in reply && typeof reply.n === 'number';

const hasCursor = (reply: unknown): reply is { cursor: { firstBatch: unknown[] } } =>
  typeof reply === 'object' &&
  reply !== null &&
  'cursor' in reply &&
  typeof reply.cursor === 'object' &&
  reply.cursor !== null &&
  'firstBatch' in reply.cursor &&
  Array.isArray(reply.cursor.firstBatch);

const isOperation = (name: string): name is OperationType => name in OPERATION_EMOJIS;

const handleCommandStarted = (event: CommandStartedEvent) => {
  if (isOperation(event.commandName) === false) return;

  const emoji = OPERATION_EMOJIS[event.commandName];
  const collection = event.command[event.commandName] || event.command['collection'] || 'unknown';
  const filter = event.command['filter'] ? JSON.stringify(event.command['filter']) : 'none';

  logger.debug(`🍃 MongoDB ${emoji} ${event.commandName} started | Collection: ${collection} | Filter: ${filter}`);
};

const handleCommandSucceeded = (event: CommandSucceededEvent) => {
  if (isOperation(event.commandName) === false) return;

  const emoji = OPERATION_EMOJIS[event.commandName];
  const collection = hasNamespace(event.reply) ? event.reply.ns.split('.')[1] || 'unknown' : 'unknown';

  let docs: number | string = 'unknown';
  if (hasDocCount(event.reply) === true) docs = event.reply.n;
  else if (hasCursor(event.reply) === true) docs = event.reply.cursor.firstBatch.length;

  logger.debug(
    `🍃 MongoDB ${emoji} ${event.commandName} completed in ${event.duration}ms | Collection: ${collection} | Docs: ${docs}`,
  );
};

client.on('commandStarted', handleCommandStarted);
client.on('commandSucceeded', handleCommandSucceeded);

client
  .connect()
  .then(() => logger.info('🟢 Connected to MongoDB!'))
  .catch(error => logger.error('🔴 Failed to connect to MongoDB:', error));

const mongodb = client.db(MONGODB_DB_NAME);

export { client, mongodb };
