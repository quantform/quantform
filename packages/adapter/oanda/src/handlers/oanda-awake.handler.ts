import {
  Asset,
  commissionPercentOf,
  AdapterContext,
  InstrumentPatchEvent
} from '@quantform/core';
import { OandaAdapter } from '../oanda.adapter';

export async function OandaAwakeHandler(
  context: AdapterContext,
  oanda: OandaAdapter
): Promise<void> {
  const response = await new Promise(resolve => {
    oanda.http.account.instruments(oanda.accountId, {}, response =>
      resolve(response.body)
    );
  });

  context.dispatch(
    ...(response['instruments'] as any[]).map(it => mapInstrument(it, context, oanda))
  );
}

function mapInstrument(
  asset: any,
  context: AdapterContext,
  oanda: OandaAdapter
): InstrumentPatchEvent {
  const base = new Asset(
    asset.name.split('_')[0].toLowerCase(),
    oanda.name,
    parseInt(asset.tradeUnitsPrecision)
  );
  const quote = new Asset(
    asset.name.split('_')[1].toLowerCase(),
    oanda.name,
    parseInt(asset.displayPrecision)
  );

  return new InstrumentPatchEvent(
    context.timestamp,
    base,
    quote,
    commissionPercentOf(0.1, 0.1),
    asset.name
  );
}
