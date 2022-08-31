export function orderNotFoundError(id: string) {
  new Error(`Trying to patch unknown order: ${id}`);
}
