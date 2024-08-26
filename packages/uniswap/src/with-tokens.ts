import { Token } from '@uniswap/sdk-core';
import { from, map } from 'rxjs';

import { withMemo } from '@quantform/core';

import { useOptions } from './use-options';

export const withTokens = withMemo(() => {
  const tokens = {} as Record<string, Token>;
  const { token } = useOptions();

  return from(token.query()).pipe(
    map(it =>
      it.reduce((tokens, { address, decimals, symbol }) => {
        tokens[`uniswap:${symbol?.toLowerCase()}`] = new Token(
          1,
          address,
          decimals,
          symbol
        );

        return tokens;
      }, tokens)
    )
  );
});
