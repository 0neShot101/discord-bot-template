import { client } from '@src/client';
import { shutdown } from '@utils/shutdown';

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

client.run();
