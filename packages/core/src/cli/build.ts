import { spawn } from 'child_process';

export default function (): Promise<number> {
  console.log('build started...');
  return new Promise<number>((resolve, reject) => {
    const process = spawn('tsc', [], { stdio: 'inherit', shell: false });

    process.once('exit', code => {
      console.log(code ? 'build failed...' : 'build success...');

      resolve(code);
    });
    process.once('error', reject);
  });
}
