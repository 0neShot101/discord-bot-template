import { exec as execCallback, execFile as execFileCallback } from 'child_process';
import { access, constants, readFile, writeFile } from 'fs/promises';
import { EOL } from 'os';
import util from 'util';

import { logger } from '@utils/logger';

const exec = util.promisify(execCallback);
const execFile = util.promisify(execFileCallback);

/**
 * Mapping of environment variable keys to their default values.
 * Undefined values are required, empty strings are optional.
 */
const ENV_VARS = {
  'DISCORD_TOKEN': undefined,
  'DISCORD_CLIENT_ID': undefined,
  'DISCORD_DEVELOPMENT_GUILD_ID': undefined,
  'MONGODB_URI': '',
  'MONGODB_DB_NAME': '',
  'REDIS_URL': '',
  'NODE_ENV': 'development',
  'LOG_LEVEL': 'info',
  'AUTO_REGISTER_COMMANDS': '',
} as const;

/**
 * Required environment variables that must be present.
 */
const REQUIRED_VARS: EnvKey[] = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'DISCORD_DEVELOPMENT_GUILD_ID'];

type EnvKey = keyof typeof ENV_VARS;

export type AppConfig = { [K in EnvKey]: string };

/**
 * Returns the shell command to open .env with a given editor.
 */
const getEditorCommand = (editor: string): string => {
  if (editor.startsWith('start')) return `${editor} .env`;
  if (editor === 'xdg-open') return `${editor} .env`;
  if (editor === 'nano' || editor === 'vim' || editor === 'vi' || editor === 'nvim' || editor === 'emacs')
    return (
      `gnome-terminal -- ${editor} .env || ` +
      `xterm -e ${editor} .env || ` +
      `konsole -e ${editor} .env || ` +
      `${editor} .env`
    );

  return `${editor} .env`;
};

/**
 * Checks if an editor is available on the system.
 */
const isEditorAvailable = async (editor: string): Promise<boolean> => {
  try {
    // For Windows "start" command, we assume it's available
    if (editor.startsWith('start')) return true;

    // Extract the executable name from the editor command (handles "code --wait" etc.)
    const editorCommand = editor.split(/\s+/)[0];
    if (!editorCommand) return false;

    // Check if the command exists using 'which' on Unix or 'where' on Windows
    // Use execFile to avoid shell injection vulnerabilities
    const checkCommand = process.platform === 'win32' ? 'where' : 'which';
    await execFile(checkCommand, [editorCommand], { 'cwd': process.cwd() });
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets a list of all available editors on the system.
 */
const getAvailableEditors = async (): Promise<string[]> => {
  const candidates: string[] = [];
  const { EDITOR, VISUAL } = process.env;

  if (EDITOR) candidates.push(EDITOR);
  if (VISUAL) candidates.push(VISUAL);

  // Platform-specific editor lists
  if (process.platform === 'win32') candidates.push('notepad', 'code', 'subl', 'atom', 'notepad++', 'start ""');
  else if (process.platform === 'darwin')
    candidates.push('code', 'subl', 'atom', 'nano', 'vim', 'nvim', 'emacs', 'open', 'gedit', 'kate');
  else
    candidates.push(
      'code',
      'subl',
      'atom',
      'nano',
      'vim',
      'vi',
      'nvim',
      'emacs',
      'gedit',
      'kate',
      'mousepad',
      'leafpad',
      'xdg-open',
    );

  // Check which editors are actually available
  const available: string[] = [];
  for (const editor of candidates) if (await isEditorAvailable(editor)) available.push(editor);

  return available;
};

/**
 * Prompts the user to select an editor from available options.
 */
const selectEditor = async (editors: string[]): Promise<string> => {
  logger.info({ editors }, 'Multiple editors detected');
  // eslint-disable-next-line no-console
  console.log('\n📝 Multiple text editors detected. Please select one:');
  editors.forEach((editor, index) => {
    // eslint-disable-next-line no-console
    console.log(`  ${index + 1}. ${editor}`);
  });
  // eslint-disable-next-line no-console
  console.log('\nEnter the number of your choice (or press Ctrl+C to cancel): ');

  // Read user input from stdin
  const readline = await import('readline');
  const rl = readline.createInterface({
    'input': process.stdin,
    'output': process.stdout,
  });

  return new Promise<string>((resolve, reject) => {
    // Handle stdin closing or Ctrl+D
    rl.on('close', () => {
      logger.warn('Editor selection cancelled or stdin closed');
      reject(new Error('Editor selection cancelled'));
    });

    // Handle SIGINT (Ctrl+C)
    rl.on('SIGINT', () => {
      logger.warn('Editor selection interrupted by user');
      rl.close();
      reject(new Error('Editor selection interrupted'));
    });

    rl.on('line', input => {
      const choice = parseInt(input.trim(), 10);
      if (choice >= 1 && choice <= editors.length) {
        const selected = editors[choice - 1];
        rl.close();
        if (selected) resolve(selected);
        else reject(new Error('Invalid editor selection'));
        // eslint-disable-next-line no-console
      } else console.log('Invalid choice. Please enter a number between 1 and', editors.length);
    });
  });
};

/**
 * Attempts to open .env in the user's preferred or a fallback editor.
 */
const openEnvironmentEditor = async (): Promise<void> => {
  logger.info('Attempting to open .env in an editor');

  const availableEditors = await getAvailableEditors();

  if (availableEditors.length === 0) {
    logger.error('No text editors found on the system');
    return;
  }

  let selectedEditor: string;
  if (availableEditors.length === 1) {
    const firstEditor = availableEditors[0];
    if (!firstEditor) {
      logger.error('Failed to get first editor from list');
      return;
    }
    selectedEditor = firstEditor;
    logger.info({ 'editor': selectedEditor }, 'Using the only available editor');
  } else {
    const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

    if (isInteractive)
      try {
        selectedEditor = await selectEditor(availableEditors);
        logger.info({ 'editor': selectedEditor }, 'User selected editor');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error({ message }, 'Editor selection failed');
        return;
      }
    else {
      const firstEditor = availableEditors[0];
      if (!firstEditor) {
        logger.error('Failed to get first editor from list in non-interactive environment');
        return;
      }
      selectedEditor = firstEditor;
      logger.info(
        { 'editor': selectedEditor },
        'Non-interactive environment detected; using the first available editor by default',
      );
    }
  }

  try {
    logger.debug({ 'editor': selectedEditor }, 'Trying to open .env');
    await exec(getEditorCommand(selectedEditor), { 'cwd': process.cwd() });
    logger.info({ 'editor': selectedEditor }, 'Successfully opened .env');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ 'editor': selectedEditor, message }, 'Failed to open .env with editor');
  }
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
    else if (REQUIRED_VARS.includes(key)) missing.push(key);
    else
      // Optional vars get empty string if not provided
      config[key] = '';
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
export const MONGODB_URI = config.MONGODB_URI || undefined;
export const MONGODB_DB_NAME = config.MONGODB_DB_NAME || undefined;
export const REDIS_URL = config.REDIS_URL || undefined;
export const NODE_ENV = config.NODE_ENV;
export const LOG_LEVEL = config.LOG_LEVEL;
export const AUTO_REGISTER_COMMANDS =
  config.AUTO_REGISTER_COMMANDS.toLowerCase() === 'true' ||
  (config.AUTO_REGISTER_COMMANDS === '' && config.NODE_ENV !== 'production');
