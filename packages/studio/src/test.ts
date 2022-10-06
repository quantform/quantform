import { assetOf, Session } from '@quantform/core';
import { distinctUntilChanged } from 'rxjs';

// eslint-disable-next-line import/no-anonymous-default-export
export default function (session: Session) {
    return session
        .balance(assetOf('binance:btc'))
        .pipe(distinctUntilChanged((lhs, rhs) => lhs.total.equals(rhs.total)));
}
