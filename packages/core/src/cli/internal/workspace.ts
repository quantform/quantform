import { join } from 'path';

import { workingDirectory } from '@lib/shared';

export function buildDirectory() {
  return join(process.cwd(), workingDirectory(), 'build');
}
