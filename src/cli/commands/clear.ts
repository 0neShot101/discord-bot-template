import { clear } from '@utils/commandRegistry';

import type { DeployScope } from '@typings/registry';

interface Flags {
  scope?: DeployScope;
}

export const run = async (flags: Flags): Promise<void> => {
  await clear(flags.scope);
};
