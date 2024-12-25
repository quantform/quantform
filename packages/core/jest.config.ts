import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { parseJsonConfigFileContent, readConfigFile, sys } from 'typescript';

const tsconfig = parseJsonConfigFileContent(
  readConfigFile('tsconfig.json', sys.readFile).config,
  sys,
  process.cwd()
);

const compilerOptions = tsconfig.raw.compilerOptions as any;

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: { ...compilerOptions, sourceMap: true }
      }
    ]
  },
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/src/cli/test.ts'],
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>'
  })
};

export default config;
