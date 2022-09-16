export function workingDirectory() {
  return './.quantform/';
}

export function getEnvVar(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}
