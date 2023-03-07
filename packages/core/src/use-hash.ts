export type dependency = string | number | { toString(): string };

export function useHash(dependencies: dependency[]) {
  return dependencies.join('/');
}
