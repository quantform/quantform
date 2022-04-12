import { join } from 'path';
import * as tsc from 'tsc-prog';

import { getWorkingDirectory } from './workspace';

export function tryTranspileModule(module: string) {
  if (!module.endsWith('.ts')) {
    return undefined;
  }

  const outDir = '.quantform/build';

  const program = tsc.createProgramFromConfig({
    basePath: process.cwd(),
    configFilePath: 'tsconfig.json',
    files: [join(getWorkingDirectory(process.cwd()), module)],
    compilerOptions: {
      outDir
    },
    include: []
  });

  tsc.emit(program, { copyOtherToOutDir: false });

  return join(
    getWorkingDirectory(join(process.cwd(), outDir)),
    module.substring(0, module.length - 3) + '.js'
  );
}
