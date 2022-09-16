export type timestamp = number;

export function now(): timestamp {
  return new Date().getTime();
}
