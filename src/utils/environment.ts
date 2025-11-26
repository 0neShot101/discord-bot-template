import { exec as execCallback } from 'child_process';
import { access, constants, readFile, writeFile } from 'fs/promises';
import { EOL } from 'os';
import util from 'util';

import { logger } from '@utils/logger';

const exec = util.promisify(execCallback);

/**
 * Mapping of environment variable keys to their default values.
 * Undefined values are required.
 */
const ENV_VARS = {
  'DISCORD_TOKEN': undefined,
  'DISCORD_CLIENT_ID': undefined,
  'DISCORD_DEVELOPMENT_GUILD_ID': undefined,
  'MONGODB_URI': undefined,
  'MONGODB_DB_NAME': undefined,
  'NODE_ENV': 'development',
  'LOG_LEVEL': 'info',
} as const;

type EnvKey = keyof typeof ENV_VARS;

export type AppConfig = { [K in EnvKey]: string };

/**
 * Returns the shell command to open .env with a given editor.
 */
const getEditorCommand = (editor: string): string => {
  if (editor.startsWith('start')) return `${editor} .env`;
  if (editor === 'xdg-open') return `${editor} .env`;
  if (editor === 'nano' || editor === 'vim')
    return (
      `gnome-terminal -- ${editor} .env || ` +
      `xterm -e ${editor} .env || ` +
      `konsole -e ${editor} .env || ` +
      `${editor} .env`
    );

  return `${editor} .env`;
};

/**
 * Attempts to open .env in the user's preferred or a fallback editor.
 */
const openEnvironmentEditor = async (): Promise<void> => {
  logger.info('Attempting to open .env in an editor');
  const candidates: string[] = [];
  const { EDITOR, VISUAL } = process.env;

  if (EDITOR) candidates.push(EDITOR);
  if (VISUAL) candidates.push(VISUAL);

  if (process.platform === 'win32') candidates.push('notepad', 'start ""');
  else if (process.platform === 'darwin') candidates.push('open', 'code');
  else candidates.push('code', 'gedit', 'kate', 'mousepad', 'leafpad', 'xdg-open', 'nano', 'vim');

  for (const editor of candidates)
    try {
      logger.debug({ editor }, 'Trying to open .env');

      await exec(getEditorCommand(editor), { 'cwd': process.cwd() });

      logger.info({ editor }, 'Successfully opened .env');
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      logger.warn({ editor, message }, 'Failed to open .env with editor');
    }

  logger.error('Could not open .env in any editor');
};

/**
 * Ensures a .env file exists by copying from .env.example
 * or generating a template with all ENV_VARS.
 */
const ensureEnvFileExists = async (): Promise<void> => {
  try {
    await access('.env', constants.F_OK);

    logger.info('.env file already exists');
  } catch {
    logger.warn('.env not found; creating one now');

    let content: string;

    try {
      content = await readFile('.env.example', 'utf-8');
      logger.info('Copied .env.example contents to .env');
    } catch {
      logger.warn('.env.example not found; generating template');

      const lines = (Object.keys(ENV_VARS) as EnvKey[]).map(key => `${key}=${EOL}`).join('');

      content = `# Environment variables${EOL}${lines}`;
      logger.debug({ 'keys': Object.keys(ENV_VARS) }, 'Template variables');
    }

    await writeFile('.env', content, 'utf-8');

    logger.info('.env file created');
  }
};

/**
 * Reads, applies defaults, and validates all environment variables.
 * @throws Error if any required variables are missing.
 */
const getValidatedConfig = (): AppConfig => {
  logger.debug('Validating environment variables');

  const config: Partial<Record<EnvKey, string>> = {};
  const missing: EnvKey[] = [];

  for (const key of Object.keys(ENV_VARS) as EnvKey[]) {
    const raw = process.env[key];
    const hasRaw = !!raw && raw.length > 0;
    const defaultValue = ENV_VARS[key];
    const value = hasRaw ? raw! : defaultValue;

    logger.debug({ key, raw, defaultValue, value }, 'Resolved env var');

    if (value && value.length > 0) config[key] = value;
    else missing.push(key);
  }

  if (missing.length > 0) {
    logger.error({ missing }, 'Missing required environment variables');

    throw new Error(`Missing required variables: ${missing.join(', ')}`);
  }

  logger.info('All required environment variables are present');

  return config as AppConfig;
};

/**
 * Loads and validates configuration, opening an editor on failure.
 * Exits after prompting in non-production mode.
 */
const initConfig = async (): Promise<AppConfig> => {
  logger.debug('Initializing configuration');

  try {
    await ensureEnvFileExists();
    const cfg = getValidatedConfig();

    logger.info('Configuration loaded successfully');

    return cfg;
  } catch (err) {
    logger.error({ err }, 'Failed to load configuration');
    if (process.env.NODE_ENV !== 'production') await openEnvironmentEditor();

    process.exit(1);
  }
};

const config = await initConfig();

export const DISCORD_TOKEN = config.DISCORD_TOKEN;
export const DISCORD_CLIENT_ID = config.DISCORD_CLIENT_ID;
export const DISCORD_DEVELOPMENT_GUILD_ID = config.DISCORD_DEVELOPMENT_GUILD_ID;
export const MONGODB_URI = config.MONGODB_URI;
export const MONGODB_DB_NAME = config.MONGODB_DB_NAME;
export const NODE_ENV = config.NODE_ENV;
export const LOG_LEVEL = config.LOG_LEVEL;
