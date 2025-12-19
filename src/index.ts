import { Client } from '@structures/Client';
import { shutdown } from '@utils/shutdown';

export const client = new Client();

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

client.run();
