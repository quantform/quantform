import { from } from 'rxjs';

import { useBot } from './use-bot';
import { useOptions } from './use-options';

export function sendMessage(message: string) {
  const { chatId } = useOptions();
  const bot = useBot();

  return from(bot.sendMessage(chatId, message));
}
