import { Observable } from 'rxjs';

import { useBot } from './use-bot';
import { useOptions } from './use-options';

export function watchMessage() {
  const { chatId } = useOptions();
  const bot = useBot();

  return new Observable(subscriber => {
    bot.on(chatId, message => subscriber.next(message));
  });
}
