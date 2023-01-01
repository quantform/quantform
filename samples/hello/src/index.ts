import { combineLatest, tap } from 'rxjs';

import { binance } from '@quantform/binance';
import { assetOf, d, fromBalance, instrumentOf, log, rule } from '@quantform/core';

export default function () {
  rule(() => fromBalance(assetOf('binance:btc')));

  return [];
}
