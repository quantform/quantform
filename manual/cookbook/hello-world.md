# Hello World

{% code title="hello.ts" lineNumbers="true" %}
```typescript
import { binance } from '@quantform/binance';
import { describe, instrumentOf, rule } from '@quantform/core';
import { tap } from 'rxjs';

describe('hello', () => {
  rule('trace executed trades', session =>
    session.trade(instrumentOf('binance:btc-usdt')).pipe(
      tap(it => {
        const { base, quote } = it.instrument;

        console.log(`${quote.fixed(it.rate)}@${base.fixed(it.quantity)}`);
      })
    )
  );

  return [binance()];
});
```
{% endcode %}
