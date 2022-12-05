export function hash(str: string): number {
  let hash = 7373;
  let i = str.length;

  while (i) {
    hash = (hash * 77) ^ str.charCodeAt(--i);
  }

  return hash >>> 0;
}
