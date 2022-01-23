import { XtbAdapter } from '../xtb-adapter';
import { ConnectionStatus } from 'xapi-node';
import {
  Asset,
  Commission,
  AdapterContext,
  InstrumentPatchEvent,
  Logger
} from '@quantform/core';

export async function XtbAwakeHandler(
  context: AdapterContext,
  xtb: XtbAdapter
): Promise<void> {
  return new Promise((resolve, reject) => {
    xtb.endpoint.onReady(async () => {
      await onConnectionReady(context, xtb);
      resolve();
    });
    xtb.endpoint.onReject(e => {
      onConnectionRejected(e);
      reject();
    });
    xtb.endpoint.onConnectionChange(e => {
      if (e == ConnectionStatus.DISCONNECTED && xtb.endpoint.tryReconnect) {
        Logger.info(`xtb reconnecting: ${ConnectionStatus[e]}`);

        xtb.endpoint.connect();
      }
    });

    xtb.endpoint.connect();
  });
}

async function onConnectionReady(
  context: AdapterContext,
  xtb: XtbAdapter
): Promise<void> {
  const response = await xtb.endpoint.Socket.send.getAllSymbols();

  const instruments = response.returnData.map(it => {
    const base = new Asset(it.symbol, xtb.name, it.tickSize);
    const quote = new Asset(it.currency, xtb.name, it.precision);
    const commision = new Commission(0.01, 0.01);

    return new InstrumentPatchEvent(
      context.timestamp,
      base,
      quote,
      commision,
      it.symbol,
      it.leverage
    );
  });

  context.dispatch(...instruments);
}

function onConnectionRejected(error: any): void {
  Logger.info('xtb connection rejected');
}
