export function adapterNotFoundError(adapterName: string) {
  return new Error(
    `Unknown adapter: ${adapterName}. You should provide adapter in session descriptor.`
  );
}

export function backtestPageNotEmpty() {
  return new Error('Backtest page is not empty');
}
