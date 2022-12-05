export class AdapterNotFoundError extends Error {
  constructor(adapterName: string) {
    super(
      `Unknown adapter: ${adapterName}. You should provide adapter in session descriptor.`
    );
  }
}

export class NoPaperEngineProvidedError extends Error {
  constructor() {
    super('No paper engine provided.');
  }
}

export class BacktestPageNotEmpty extends Error {
  constructor() {
    super('Backtest page is not empty');
  }
}
