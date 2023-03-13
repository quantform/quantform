import { join } from 'path';
import { encode } from 'querystring';
import { ZodType } from 'zod';

import { RequestMethod, useRequest } from '@quantform/core';

import { useBinanceLogger } from './use-binance-logger';
import { useBinanceOptions } from './use-binance-options';

export function useBinanceRequest<T extends ZodType>(
  schema: T,
  args: {
    method: RequestMethod;
    patch: string;
    query: Record<string, string | number | undefined>;
    headers?: Record<string, any>;
  }
) {
  const { apiUrl } = useBinanceOptions();

  const url = join(apiUrl, args.patch);
  const query = encode(args.query);

  const { debug } = useBinanceLogger();

  debug(`requesting`, args);

  return useRequest<T>(schema, {
    method: args.method,
    url: `${url}?${query}`,
    headers: args.headers ?? {}
  });
}
