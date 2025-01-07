import { useMemo } from '@quantform/core';
import TelegramBot = require('node-telegram-bot-api');
import { useOptions } from './use-options';

export function useBot() {
  const { token, polling } = useOptions();

  return useMemo(() => new TelegramBot(token, { polling }), ['telegram', 'telegram-bot']);
}
