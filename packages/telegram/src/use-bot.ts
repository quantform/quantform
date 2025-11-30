import { Bot } from 'grammy';

import { useMemo } from '@quantform/core';

import { useOptions } from './use-options';

export function useBot() {
  const { token } = useOptions();

  return useMemo(() => new Bot(token), ['telegram', 'telegram-bot']);
}
