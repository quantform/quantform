import { join } from 'path';

import { workingDirectory } from './../../shared';

export function buildDirectory() {
  return join(process.cwd(), workingDirectory(), 'build');
}
