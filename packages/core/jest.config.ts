/* eslint-disable */
export default {
  displayName: 'core',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/core',
  testPathIgnorePatterns : [
    "src/lib/cli/test.ts",
  ],
};
