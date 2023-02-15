import { join } from 'path';
import { encode } from 'querystring';

import { RequestMethod, useLogger, useRequest } from '@quantform/core';

import { useBinanceOptions } from './use-binance-options';

export function useBinanceRequest<T>(args: {
  method: RequestMethod;
  patch: string;
  query: Record<string, string | number | undefined>;
  headers?: Record<string, any>;
}) {
  const { apiUrl } = useBinanceOptions();

  const url = join(apiUrl, args.patch);
  const query = encode(args.query);

  const { debug } = useLogger('binance');

  debug(`requesting`, args);

  return useRequest<T>({
    method: args.method,
    url: `${url}?${query}`,
    headers: args.headers ?? {}
  });
}
