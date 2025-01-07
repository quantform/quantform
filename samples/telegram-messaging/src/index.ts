import * as dotenv from 'dotenv';
import { switchMap } from 'rxjs';

import { after, before, behavior, strategy } from '@quantform/core';
import { ethereum, useEthereum } from '@quantform/ethereum';
import { telegram, useTelegram } from '@quantform/telegram';

export default strategy(() => {
  dotenv.config();

  before(() => {
    const { sendMessage } = useTelegram();

    return sendMessage('bot started');
  });

  behavior(() => {
    const { whenBlock } = useEthereum();
    const { sendMessage } = useTelegram();

    return whenBlock().pipe(switchMap(it => sendMessage(`new block created ${it}`)));
  });

  after(() => {
    const { sendMessage } = useTelegram();

    return sendMessage('bot finished');
  });

  return [
    ...ethereum({
      rpc: {
        wss: process.env.ETH_RPC_WSS
      }
    }),
    ...telegram({
      token: process.env.TELEGRAM_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
      polling: true
    })
  ];
});
