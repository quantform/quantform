import fs = require('fs');

export function workingDirectory() {
  return './.quantform/';
}

export function readConfig() {
  const json = JSON.parse(fs.readFileSync('./qfconfig.json', 'utf-8'));

  return json;
}
