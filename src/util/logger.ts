import pino from 'pino';

const logger: pino.Logger = pino({
  'transport': {
    'target': 'pino-pretty',
    'options': {
      'colorize': true,
      'translateTime': 'yyyy-mm-dd HH:MM:ss',
      'ignore': 'pid,hostname',
      'levelFirst': true,
      'messageFormat': '{msg}',
    },
  },
});

export default logger;
