import { join } from 'path';
import { encode } from 'querystring';
import { defer } from 'rxjs';
import { ZodType } from 'zod';

import { RequestMethod, useRequest } from '@quantform/core';

import { useBinanceLogger } from './use-logger';
import { useOptions } from './use-options';

export function usePublicRequest(args: {
  method: RequestMethod;
  patch: string;
  query: Record<string, string | number | undefined>;
  headers?: Record<string, any>;
}) {
  const { apiUrl } = useOptions();

  const url = join(apiUrl, args.patch);
  const query = encode(args.query);

  const { debug } = useBinanceLogger();

  return defer(() => {
    debug(`requesting`, args);

    return useRequest({
      method: args.method,
      url: `${url}?${query}`,
      headers: args.headers ?? {}
    });
  });
}
