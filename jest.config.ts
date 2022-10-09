import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testPathIgnorePatterns: ['packages/core/src/cli/test.ts']
};

export default config;
