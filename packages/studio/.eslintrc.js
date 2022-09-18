module.exports = {
  extends: ['next/babel', 'next/core-web-vitals'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './tsconfig.server.json']
  }
};
