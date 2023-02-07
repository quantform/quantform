import { join } from 'path';
import { encode } from 'querystring';

import { RequestMethod, useRequest } from '@quantform/core';

import { useBinanceOptions } from './use-binance-options';

export function useBinanceRequest<T>(args: {
  method: RequestMethod;
  patch: string;
  query: Record<string, string | number | undefined>;
}) {
  const { apiUrl } = useBinanceOptions();

  const url = join(apiUrl, args.patch);
  const query = encode(args.query);

  return useRequest<T>({
    method: args.method,
    url: `${url}?${query}`,
    headers: {}
  });
}
