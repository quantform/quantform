export type dependency = { toString(): string } | undefined;

export function useHash(dependencies: dependency[]) {
  return dependencies.join('/');
}
