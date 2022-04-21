import { spawn } from 'child_process';

import { buildDirectory } from './internal/workspace';

export default async function (): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const process = spawn('swc', ['./src', '--out-dir', buildDirectory()], {
      stdio: 'inherit',
      shell: false
    });

    process.once('exit', resolve);
    process.once('error', reject);
  });
}
