import { spawn } from 'child_process';

import { buildDirectory } from '@lib/cli/internal/workspace';

export default async function (): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const child = spawn(
      'tsc',
      ['--project', 'tsconfig.json', '--outDir', buildDirectory()],
      {
        cwd: process.cwd(),
        stdio: 'inherit'
      }
    );

    child.once('exit', resolve);
    child.once('error', reject);
  });
}
