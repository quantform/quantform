import { sendMessage } from './send-message';
import { useBot } from './use-bot';
import { options, TelegramOptions, useOptions } from './use-options';
import { watchMessage } from './watch-message';

export function telegram(opts: Partial<TelegramOptions>) {
  return [options(opts)];
}

export const useTelegram = () => ({
  name: 'telegram' as const,
  useOptions,
  useBot,
  sendMessage,
  watchMessage
});
