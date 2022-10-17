export function workingDirectory() {
  return './.quantform/';
}

export function getEnvVar(name: string, optional = false): string {
  const value = process.env[name];

  if (!value && !optional) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value ?? '';
}
