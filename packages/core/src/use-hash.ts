export type dependency = string | number | { hash(): string };

export function useHash(dependencies: dependency[]) {
  return dependencies.join('/');
}
