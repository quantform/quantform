import { provider, useContext } from '@quantform/core';

@provider()
export class TelegramOptions {
  readonly polling: boolean = false;

  constructor(readonly token: string, readonly chatId: string) {}
}

export function options(options: Partial<TelegramOptions>) {
  return {
    provide: TelegramOptions,
    useValue: options
  };
}

export function useOptions() {
  return useContext(TelegramOptions);
}
