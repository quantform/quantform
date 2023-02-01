export function useHash(dependencies: unknown[]) {
  return dependencies.join('/');
}
