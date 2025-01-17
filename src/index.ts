import path from 'path';

import Client from './structures/Client';

const client = new Client({
  'commandsDirectory': path.resolve(__dirname, 'commands'),
  'eventsDirectory': path.resolve(__dirname, 'events'),
  'prefix': '!',
  'owners': [''],
  'name': 'Bot',
});

client.login(process.env.token);

export default client;
