/* eslint-disable no-console */
import { logger } from '@utils/logger';

import type { DeployScope } from '@typings/registry';

const SUBCOMMANDS = ['deploy', 'clear', 'list'] as const;
type Subcommand = (typeof SUBCOMMANDS)[number];

const isSubcommand = (value: string): value is Subcommand => (SUBCOMMANDS as readonly string[]).includes(value);

const printUsage = () => {
  console.log('Usage: bun run commands <subcommand>\n');
  console.log('Subcommands:');
  console.log('  deploy   Deploy slash commands to Discord');
  console.log('  clear    Remove all registered commands from Discord');
  console.log('  list     Compare local commands against registered commands\n');
  console.log('Flags:');
  console.log('  --global   Force global scope (production)');
  console.log('  --guild    Force guild scope (development)');
  console.log('  --force    Skip change detection and force deploy');
};

const args = process.argv.slice(2);
const subcommand = args[0];

if (subcommand === undefined || isSubcommand(subcommand) === false) {
  printUsage();
  process.exit(subcommand === undefined ? 0 : 1);
}

const hasFlag = (flag: string) => args.includes(flag);

if (hasFlag('--global') && hasFlag('--guild')) {
  logger.error('Cannot specify both --global and --guild');
  process.exit(1);
}

const scope: DeployScope | undefined = hasFlag('--global') ? 'global' : hasFlag('--guild') ? 'guild' : undefined;

const force = hasFlag('--force');

const handler = await import(`@cli/commands/${subcommand}`);
await handler.run({ scope, force });
